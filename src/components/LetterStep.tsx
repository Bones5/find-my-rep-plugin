import React, { useState, useRef } from "react";
import type { SelectableRepresentative } from "../types";

interface LetterStepProps {
  selectedReps: SelectableRepresentative[];
  letterTemplate: string;
  onSend: (
    senderName: string,
    senderEmail: string,
    letterContent: string,
    honeypot: string,
  ) => void;
  loading: boolean;
  success?: string;
}

export const LetterStep: React.FC<LetterStepProps> = ({
  letterTemplate,
  onSend,
  loading,
  success,
}) => {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [letterContent, setLetterContent] = useState(letterTemplate);
  const honeypotRef = useRef<HTMLInputElement>(null);

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
      alert("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(senderEmail)) {
      // eslint-disable-next-line no-alert
      alert("Please enter a valid email address.");
      return;
    }

    if (containsTooManyLinks(letterContent)) {
      // eslint-disable-next-line no-alert
      alert("Please remove excessive links before sending your message.");
      return;
    }

    const honeypotValue = honeypotRef.current?.value || "";
    onSend(senderName, senderEmail, letterContent, honeypotValue);
  };

  return (
    <div className="find-my-rep-step step-letter">
      <h3>Review and Edit Your Letter</h3>
      <div className="letter-fields">
        <label htmlFor="sender-name">Your Name:</label>
        <input
          type="text"
          id="sender-name"
          className="sender-name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          required
          disabled={loading || !!success}
        />

        <label htmlFor="sender-email">Your Email:</label>
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
        Please keep your message respectful. Abusive, threatening, or spam-like
        content will be blocked.
      </p>
      {/* Honeypot field — hidden from real users, attracts bots */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label htmlFor="website-url">Website</label>
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
        <button
          className="button button-primary send-btn send-button"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      )}
      {success && (
        <div className="success-message" style={{ display: "block" }}>
          {success}
        </div>
      )}
    </div>
  );
};
