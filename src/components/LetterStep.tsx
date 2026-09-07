import React, { useEffect, useRef } from "react";
import { __ } from "@wordpress/i18n";
import type { SelectableRepresentative } from "../types";
import { useSessionStorage } from "../hooks/useSessionStorage";

interface LetterStepProps {
  blockId: string;
  storageKey: string;
  selectedReps: SelectableRepresentative[];
  letterTemplate: string;
  questionResponse: string;
  onSend: (
    senderName: string,
    senderEmail: string,
    senderAddress: string,
    letterContent: string,
    honeypot: string,
  ) => void;
  onBack: () => void;
  loading: boolean;
  success?: string;
}

export const LetterStep: React.FC<LetterStepProps> = ({
  storageKey,
  letterTemplate,
  questionResponse,
  onSend,
  onBack,
  loading,
  success,
}) => {
  const [senderName, setSenderName, clearName] = useSessionStorage<string>(
    `${storageKey}-name`,
    "",
  );
  const [senderEmail, setSenderEmail, clearEmail] = useSessionStorage<string>(
    `${storageKey}-email`,
    "",
  );
  const [senderAddress, setSenderAddress, clearAddress] =
    useSessionStorage<string>(`${storageKey}-address`, "");
  const representativeNamePlaceholder = __(
    "[representative's name]",
    "find-my-rep",
  );
  const representativeTitlePlaceholder = __(
    "[representative's title]",
    "find-my-rep",
  );
  const populatedTemplate = letterTemplate
    .split("{{question_response}}")
    .join(questionResponse)
    .split("{{representative_name}}")
    .join(representativeNamePlaceholder)
    .split("{{representative_title}}")
    .join(representativeTitlePlaceholder);
  const [letterContent, setLetterContent, clearContent] =
    useSessionStorage<string>(`${storageKey}-content`, populatedTemplate);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const readableContent = letterContent
      .split("{{question_response}}")
      .join(questionResponse)
      .split("{{representative_name}}")
      .join(representativeNamePlaceholder)
      .split("{{representative_title}}")
      .join(representativeTitlePlaceholder);

    if (readableContent !== letterContent) {
      setLetterContent(readableContent);
    }
  }, [
    letterContent,
    questionResponse,
    representativeNamePlaceholder,
    representativeTitlePlaceholder,
    setLetterContent,
  ]);

  // Once the success message is shown, the user's progress is complete —
  // clear persisted letter fields so a future visit starts fresh.
  useEffect(() => {
    if (success) {
      clearName();
      clearEmail();
      clearAddress();
      clearContent();
    }
    // Intentionally omitting clear* from deps — they are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const containsTooManyLinks = (value: string): boolean => {
    const links = value.match(/(https?:\/\/|www\.)/gi);
    return (links?.length || 0) > 2;
  };

  const handleSend = () => {
    if (
      !senderName.trim() ||
      !senderEmail.trim() ||
      !senderAddress.trim() ||
      !letterContent.trim()
    ) {
      // eslint-disable-next-line no-alert
      alert(__("Please fill in all fields.", "find-my-rep"));
      return;
    }

    if (!isValidEmail(senderEmail)) {
      // eslint-disable-next-line no-alert
      alert(__("Please enter a valid email address.", "find-my-rep"));
      return;
    }

    if (containsTooManyLinks(letterContent)) {
      // eslint-disable-next-line no-alert
      alert(
        __(
          "Please remove excessive links before sending your message.",
          "find-my-rep",
        ),
      );
      return;
    }

    const honeypotValue = honeypotRef.current?.value || "";
    const personalizedContent = letterContent
      .split(representativeNamePlaceholder)
      .join("{{representative_name}}")
      .split(representativeTitlePlaceholder)
      .join("{{representative_title}}");
    onSend(
      senderName,
      senderEmail,
      senderAddress,
      personalizedContent,
      honeypotValue,
    );
  };

  return (
    <div className="find-my-rep-step step-letter">
      <h3>{__("Review and send your message", "find-my-rep")}</h3>
      <div className="letter-fields">
        <label htmlFor="sender-name">
          {__("Your Name:", "find-my-rep")}
        </label>
        <input
          type="text"
          id="sender-name"
          className="sender-name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          required
          disabled={loading || !!success}
        />

        <label htmlFor="sender-email">
          {__("Your Email:", "find-my-rep")}
        </label>
        <input
          type="email"
          id="sender-email"
          className="sender-email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          required
          disabled={loading || !!success}
        />

        <label htmlFor="sender-address">
          {__("Your Address:", "find-my-rep")}
        </label>
        <textarea
          id="sender-address"
          className="sender-address"
          rows={3}
          maxLength={500}
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          required
          disabled={loading || !!success}
        />
      </div>
      <section
        className="letter-preview"
        aria-labelledby="letter-preview-heading"
      >
        <h4 id="letter-preview-heading">
          {__("Message preview", "find-my-rep")}
        </h4>
        <p className="letter-preview-intro">
          {__(
            "Review and edit your message below. Bracketed representative details are personalized for each recipient, and your name and address are added as the sign-off.",
            "find-my-rep",
          )}
        </p>
        <label className="screen-reader-text" htmlFor="letter-content">
          {__("Message content", "find-my-rep")}
        </label>
        <div className="letter-document">
          <textarea
            id="letter-content"
            className="letter-content"
            rows={15}
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            disabled={loading || !!success}
          />
          <footer className="letter-signoff" aria-live="polite">
            <p>{__("Yours sincerely,", "find-my-rep")}</p>
            <p
              className={!senderName.trim() ? "letter-signoff-placeholder" : ""}
            >
              {senderName.trim() || __("Your name", "find-my-rep")}
            </p>
            <p
              className={
                !senderAddress.trim() ? "letter-signoff-placeholder" : ""
              }
            >
              {senderAddress.trim() || __("Your address", "find-my-rep")}
            </p>
          </footer>
        </div>
      </section>
      <p className="letter-guidance">
        {__(
          "Please keep your message respectful. Abusive, threatening, or spam-like content will be blocked.",
          "find-my-rep",
        )}
      </p>
      {/* Honeypot field — hidden from real users, attracts bots */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label htmlFor="website-url">{__("Website", "find-my-rep")}</label>
        <input
          type="text"
          id="website-url"
          name="website_url"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {!success && (
        <div className="step-buttons">
          <button
            className="button back-btn"
            onClick={onBack}
            type="button"
            disabled={loading}
          >
            <span aria-hidden="true">←</span>{" "}
            {__("Back", "find-my-rep")}
          </button>
          <button
            className="button button-primary send-btn send-button"
            onClick={handleSend}
            disabled={loading}
          >
            {loading
              ? __("Sending...", "find-my-rep")
              : __("Send", "find-my-rep")}
          </button>
        </div>
      )}
      {success && (
        <div className="success-message" style={{ display: "block" }}>
          {success}
        </div>
      )}
    </div>
  );
};
