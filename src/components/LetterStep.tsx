import React, { useEffect, useRef } from "react";
import { __ } from "@wordpress/i18n";
import type { SelectableRepresentative } from "../types";
import { useSessionStorage } from "../hooks/useSessionStorage";

interface LetterStepProps {
  blockId: string;
  storageKey: string;
  selectedReps: SelectableRepresentative[];
  letterTemplate: string;
  onSend: (
    senderName: string,
    senderEmail: string,
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
  const [letterContent, setLetterContent, clearContent] =
    useSessionStorage<string>(`${storageKey}-content`, letterTemplate);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Once the success message is shown, the user's progress is complete —
  // clear persisted letter fields so a future visit starts fresh.
  useEffect(() => {
    if (success) {
      clearName();
      clearEmail();
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
    if (!senderName.trim() || !senderEmail.trim() || !letterContent.trim()) {
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
    onSend(senderName, senderEmail, letterContent, honeypotValue);
  };

  return (
    <div className="find-my-rep-step step-letter">
      <h3>{__("Review and Edit Your Letter", "find-my-rep")}</h3>
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
      </div>
      <textarea
        className="letter-content"
        rows={15}
        value={letterContent}
        onChange={(e) => setLetterContent(e.target.value)}
        disabled={loading || !!success}
      />
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
