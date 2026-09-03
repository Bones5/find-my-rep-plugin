import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FindMyRepApp } from "../../src/components/FindMyRepApp";

jest.mock("../../src/components/PostcodeStep", () => ({
  PostcodeStep: ({
    onFindReps,
  }: {
    onFindReps: (postcode: string) => void;
  }) => <button onClick={() => onFindReps("CF10 1AA")}>Find reps</button>,
}));

jest.mock("../../src/components/SelectStep", () => ({
  SelectStep: ({
    onContinue,
  }: {
    onContinue: (reps: Array<Record<string, unknown>>) => void;
  }) => (
    <button
      onClick={() =>
        onContinue([
          {
            type: "MP",
            id: 1,
            name: "Jane Representative",
            email: "jane.official@example.org",
            constituency: "Cardiff Test",
          },
        ])
      }
    >
      Continue
    </button>
  ),
}));

jest.mock("../../src/components/LetterStep", () => ({
  LetterStep: ({
    onSend,
  }: {
    onSend: (
      senderName: string,
      senderEmail: string,
      letterContent: string,
      honeypot: string,
    ) => void;
  }) => (
    <button
      onClick={() =>
        onSend("Test User", "test@example.com", "Updated letter content", "")
      }
    >
      Send letter
    </button>
  ),
}));

describe("FindMyRepApp", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.findMyRepData = {
      ajaxUrl: "/wp-admin/admin-ajax.php",
      nonce: "test-nonce",
      letterTemplate: "Dear {{representative_name}}",
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            postcode: "CF10 1AA",
            mp: {
              id: 1,
              name: "Jane Representative",
              email: "jane.official@example.org",
              party: "Test Party",
              constituency: "Cardiff Test",
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: "Successfully sent 1 letter(s)." },
        }),
      }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("includes the looked-up postcode when sending letters", async () => {
    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    await screen.findByRole("button", { name: /Continue/i });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await screen.findByRole("button", { name: /Send letter/i });
    fireEvent.click(screen.getByRole("button", { name: /Send letter/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const sendRequest = (global.fetch as jest.Mock).mock.calls[1][1] as {
      body: URLSearchParams;
    };

    expect(sendRequest.body.get("postcode")).toBe("CF10 1AA");
    expect(sendRequest.body.get("question_response")).toBe("");
    expect(sendRequest.body.get("website_url")).toBe("");
  });

  test("shows an enabled question and allows an empty response", async () => {
    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        includeQuestion
        questionText="What change would help your community?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Continue/i }));

    expect(
      await screen.findByRole("heading", {
        name: "What change would help your community?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Send letter/i }),
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const sendRequest = (global.fetch as jest.Mock).mock.calls[1][1] as {
      body: URLSearchParams;
    };
    expect(sendRequest.body.get("question_response")).toBe("");
  });

  test("submits the question response separately from letter content", async () => {
    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        includeQuestion
        questionText="What change would help your community?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    fireEvent.change(
      await screen.findByLabelText(/Your response \(optional\)/i),
      { target: { value: "More frequent bus services." } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Send letter/i }),
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const sendRequest = (global.fetch as jest.Mock).mock.calls[1][1] as {
      body: URLSearchParams;
    };
    expect(sendRequest.body.get("question_response")).toBe(
      "More frequent bus services.",
    );
    expect(sendRequest.body.get("letter_content")).toBe(
      "Updated letter content",
    );
  });
});
