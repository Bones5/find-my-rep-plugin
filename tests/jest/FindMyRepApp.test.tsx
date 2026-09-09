import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FindMyRepApp } from "../../src/components/FindMyRepApp";

jest.mock("../../src/components/PostcodeStep", () => ({
  PostcodeStep: ({
    onFindReps,
    initialPostcode,
  }: {
    onFindReps: (postcode: string) => void;
    initialPostcode?: string;
  }) => (
    <>
      <input aria-label="Postcode" defaultValue={initialPostcode} />
      <button onClick={() => onFindReps("CF10 1AA")}>Find reps</button>
    </>
  ),
}));

jest.mock("../../src/components/LetterStep", () => ({
  LetterStep: ({
    onSend,
  }: {
    onSend: (
      senderName: string,
      senderEmail: string,
      senderAddress: string,
      letterContent: string,
      honeypot: string,
    ) => void;
  }) => (
    <button
      onClick={() =>
        onSend(
          "Test User",
          "test@example.com",
          "10 Test Street\nCardiff\nCF10 1AA",
          "Updated letter content",
          "",
        )
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
        representativeTypes={["MP"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    expect(await screen.findByRole("checkbox")).toBeChecked();
    expect(
      screen.getByRole("heading", {
        name: "For postcode CF10 1AA you have 1 representative available to contact:",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Find reps/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const sendButton = await screen.findByRole("button", {
      name: /Send letter/i,
    });
    const summary = screen
      .getByRole("heading", { name: "Message recipients" })
      .closest("section");
    expect(
      screen.getByText(
        "For postcode CF10 1AA, we will send your message to the following 1 representative:",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Jane Representative")).toBeInTheDocument();
    expect(summary).not.toBeNull();
    expect(
      summary!.compareDocumentPosition(sendButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Send letter/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const sendRequest = (global.fetch as jest.Mock).mock.calls[1][1] as {
      body: URLSearchParams;
    };

    expect(sendRequest.body.get("postcode")).toBe("CF10 1AA");
    expect(sendRequest.body.get("block_id")).toBe("test-block");
    expect(sendRequest.body.get("question_response")).toBe("");
    expect(sendRequest.body.get("sender_address")).toBe(
      "10 Test Street\nCardiff\nCF10 1AA",
    );
    expect(sendRequest.body.get("website_url")).toBe("");
    expect(sendRequest.body.get("representative_types")).toBe('["MP"]');
    expect(sendRequest.body.get("representative_types_signature")).toBe(
      "signed-types",
    );
    expect(sendRequest.body.get("representatives")).toBe(
      '[{"type":"MP","id":1}]',
    );
  });

  test("restart clears results and returns to postcode search", async () => {
    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        representativeTypes={["MP"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    expect(
      await screen.findByRole("heading", {
        name: "For postcode CF10 1AA you have 1 representative available to contact:",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    expect(
      screen.getByRole("button", { name: /Find reps/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Postcode" })).toHaveValue("");
    expect(
      screen.queryByRole("heading", { name: /available to contact/ }),
    ).not.toBeInTheDocument();
    expect(sessionStorage.getItem("fmr-/test/-0-representatives")).toBeNull();
    expect(sessionStorage.getItem("fmr-/test/-0-selected")).toBeNull();
    expect(sessionStorage.getItem("fmr-/test/-0-postcode")).toBeNull();
  });

  test("does not show who to contact after a failed search", async () => {
    (global.fetch as jest.Mock).mockReset().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        data: { message: "No representatives found." },
      }),
    });

    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        representativeTypes={["MP"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByRole("heading", { name: /available to contact/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Restart" })).toBeNull();
  });

  test("sends only representatives left selected by the user", async () => {
    (global.fetch as jest.Mock)
      .mockReset()
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
            mss: [
              {
                id: 2,
                name: "Morgan Representative",
                email: "morgan.official@example.org",
                party: "Test Party",
                constituency: "Cardiff Test",
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: "Successfully sent 1 letter." },
        }),
      });

    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        representativeTypes={["MP", "MS"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Send letter/i }),
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const sendRequest = (global.fetch as jest.Mock).mock.calls[1][1] as {
      body: URLSearchParams;
    };
    expect(sendRequest.body.get("representatives")).toBe(
      '[{"type":"MS","id":2}]',
    );
  });

  test("shows an enabled question and allows an empty response", async () => {
    render(
      <FindMyRepApp
        blockId="test-block"
        storageKey="fmr-/test/-0"
        perBlockTemplate=""
        includeQuestion
        questionText="What change would help your community?"
        representativeTypes={["MP"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    expect(
      await screen.findByRole("heading", {
        name: "A question before you continue",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Answer the optional question below, then continue to review your message.",
      ),
    ).toBeInTheDocument();
    const questionField = await screen.findByLabelText(
      "What change would help your community?",
    );
    const summary = screen
      .getByRole("heading", { name: "Message recipients" })
      .closest("section");

    expect(summary).not.toBeNull();
    expect(
      summary!.compareDocumentPosition(questionField) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

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
        representativeTypes={["MP"]}
        representativeTypesSignature="signed-types"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Find reps/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    fireEvent.change(
      await screen.findByLabelText("What change would help your community?"),
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
