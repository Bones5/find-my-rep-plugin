import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SuccessStep } from "../../src/components/SuccessStep";

describe("SuccessStep", () => {
  const props = {
    message: "Successfully sent 1 letter.",
    reps: [],
    senderEmail: "sender@example.com",
    onStartOver: jest.fn(),
  };

  test("asks users to forward replies to the configured email address", () => {
    const { container } = render(
      <SuccessStep
        {...props}
        replyForwardEmail="replies@example.com"
      />,
    );

    expect(
      screen.getByText(
        "If you receive a reply from your representatives, we'd appreciate it if you could forward it to replies@example.com for our records.",
      ),
    ).toBeInTheDocument();
    expect(container.querySelector(".success-summary")).toHaveClass(
      "success-message",
    );
  });

  test("omits the forwarding instruction when no email is configured", () => {
    render(<SuccessStep {...props} />);

    expect(
      screen.queryByText(/we'd appreciate it if you could forward it/),
    ).not.toBeInTheDocument();
  });
});
