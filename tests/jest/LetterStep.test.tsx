import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LetterStep } from "../../src/components/LetterStep";
import type { SelectableRepresentative } from "../../src/types";

describe("LetterStep Component", () => {
  const mockSelectedReps: SelectableRepresentative[] = [
    {
      type: "MP",
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      party: "Labour",
      constituency: "Test Constituency",
    },
  ];

  const mockOnSend = jest.fn();
  const mockOnBack = jest.fn();
  const defaultProps = {
    blockId: "test-block",
    storageKey: "fmr-/test/-0",
    selectedReps: mockSelectedReps,
    letterTemplate: "Dear {{representative_name}},\n\nTest letter content.",
    questionResponse: "",
    onSend: mockOnSend,
    onBack: mockOnBack,
    loading: false,
  };

  beforeEach(() => {
    mockOnSend.mockClear();
    mockOnBack.mockClear();
    sessionStorage.clear();
  });

  test("renders the letter step with initial template", () => {
    render(<LetterStep {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Message preview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review and edit your message below. Bracketed representative details are personalized for each recipient, and your name and address are added as the sign-off.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Address:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /Your Name:/i }),
    ).toBeInTheDocument();

    const textarea = screen.getByDisplayValue(
      /Dear \[representative's name\]/i,
    );
    expect(textarea).toBeInTheDocument();
  });

  test("shows validation alert when name is empty", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    const sendButton = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(sendButton);

    expect(alertSpy).toHaveBeenCalledWith("Please fill in all fields.");
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("shows validation alert when email is empty", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Your Name:/i);
    fireEvent.change(nameInput, { target: { value: "Test User" } });

    const sendButton = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(sendButton);

    expect(alertSpy).toHaveBeenCalledWith("Please fill in all fields.");
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("shows validation alert when email is invalid", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const addressInput = screen.getByLabelText(/Your Address:/i);

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(addressInput, {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });

    const sendButton = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(sendButton);

    expect(alertSpy).toHaveBeenCalledWith(
      "Please enter a valid email address.",
    );
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("calls onSend with correct data when form is valid", () => {
    render(<LetterStep {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const addressInput = screen.getByLabelText(/Your Address:/i);
    const letterTextarea = screen.getByDisplayValue(
      /Dear \[representative's name\]/i,
    );

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(addressInput, {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });
    fireEvent.change(letterTextarea, {
      target: { value: "Updated letter content" },
    });

    const sendButton = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith(
      "Test User",
      "test@example.com",
      "10 Test Street\nCardiff\nCF10 1AA",
      "Updated letter content",
      "",
    );
  });

  test("populates the preview sign-off from the sender fields", () => {
    render(<LetterStep {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Your Address:/i), {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });

    const signoff = screen.getByText("Yours sincerely,").closest("footer");
    expect(signoff).toHaveTextContent("Test User");
    expect(signoff).toHaveTextContent("10 Test Street Cardiff CF10 1AA");
    expect(signoff).not.toHaveTextContent("Your name");
    expect(signoff).not.toHaveTextContent("Your address");
  });

  test("includes honeypot field value in onSend call (empty by default)", () => {
    render(<LetterStep {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Your Address:/i), {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(mockOnSend).toHaveBeenCalledWith(
      "Test User",
      "test@example.com",
      "10 Test Street\nCardiff\nCF10 1AA",
      expect.any(String),
      "",
    );
  });

  test("shows guidance about respectful messages", () => {
    render(<LetterStep {...defaultProps} />);

    expect(
      screen.getByText(
        /Abusive, threatening, or spam-like content will be blocked\./i,
      ),
    ).toBeInTheDocument();
  });

  test("blocks excessive links before sending", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Your Address:/i), {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });
    fireEvent.change(
      screen.getByDisplayValue(/Dear \[representative's name\]/i),
      {
        target: { value: "Visit https://a.com https://b.com https://c.com" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Please remove excessive links before sending your message.",
    );
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test('displays "Sending..." when loading', () => {
    render(<LetterStep {...defaultProps} loading={true} />);

    const sendButton = screen.getByRole("button", { name: /Sending.../i });
    expect(sendButton).toBeDisabled();
  });

  test("displays success message when provided", () => {
    render(
      <LetterStep {...defaultProps} success="Letters sent successfully!" />,
    );

    expect(screen.getByText("Letters sent successfully!")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Send/i }),
    ).not.toBeInTheDocument();
  });

  test("disables inputs when loading", () => {
    render(<LetterStep {...defaultProps} loading={true} />);

    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const addressInput = screen.getByLabelText(/Your Address:/i);
    const letterTextarea = screen.getByDisplayValue(
      /Dear \[representative's name\]/i,
    );

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test("disables inputs when success is shown", () => {
    render(<LetterStep {...defaultProps} success="Success!" />);

    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const addressInput = screen.getByLabelText(/Your Address:/i);
    const letterTextarea = screen.getByDisplayValue(
      /Dear \[representative's name\]/i,
    );

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(addressInput).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test("send button has send-button class for testing", () => {
    render(<LetterStep {...defaultProps} />);

    const sendButton = screen.getByRole("button", { name: /Send/i });
    expect(sendButton).toHaveClass("send-button");
  });

  test("allows editing letter content", () => {
    render(<LetterStep {...defaultProps} />);

    const letterTextarea = screen.getByDisplayValue(
      /Dear \[representative's name\]/i,
    );
    const newContent = "Completely new letter";

    fireEvent.change(letterTextarea, { target: { value: newContent } });

    expect(screen.getByDisplayValue(newContent)).toBeInTheDocument();
  });

  test("populates the question response in the letter preview", () => {
    render(
      <LetterStep
        {...defaultProps}
        letterTemplate={
          "Dear {{representative_name}},\n\n{{question_response}}"
        }
        questionResponse="More frequent bus services."
      />,
    );

    expect(
      screen.getByDisplayValue(/More frequent bus services/),
    ).toHaveValue(
      "Dear [representative's name],\n\nMore frequent bus services.",
    );
    expect(screen.queryByDisplayValue(/{{question_response}}/)).toBeNull();
  });

  test("restores representative name and title tokens when sending", () => {
    render(
      <LetterStep
        {...defaultProps}
        letterTemplate={
          "Dear {{representative_name}},\n\nAs {{representative_title}}, please help."
        }
      />,
    );

    expect(screen.getByLabelText("Message content")).toHaveValue(
      "Dear [representative's name],\n\nAs [representative's title], please help.",
    );

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email:/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Your Address:/i), {
      target: { value: "10 Test Street\nCardiff\nCF10 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(mockOnSend).toHaveBeenCalledWith(
      "Test User",
      "test@example.com",
      "10 Test Street\nCardiff\nCF10 1AA",
      "Dear {{representative_name}},\n\nAs {{representative_title}}, please help.",
      "",
    );
  });
});
