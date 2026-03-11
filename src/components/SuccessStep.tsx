import React from "react";
import type { SelectableRepresentative } from "../types";

interface SuccessStepProps {
  message: string;
  reps: SelectableRepresentative[];
  senderEmail: string;
  onStartOver: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  message,
  reps,
  senderEmail,
  onStartOver,
}) => {
  const repWord = reps.length !== 1 ? "representatives" : "representative";

  return (
    <div className="find-my-rep-step step-success">
      <div className="success-header">
        <span className="success-check-icon" aria-hidden="true" />
        <h3>Your letter has been sent!</h3>
      </div>

      <p className="success-summary">{message}</p>

      {reps.length > 0 && (
        <div className="success-recipients">
          <h4>Sent to:</h4>
          <ul>
            {reps.map((rep) => (
              <li key={`${rep.type}-${rep.id}`}>
                <strong>{rep.name}</strong>
                {rep.type && (
                  <span className="success-rep-type"> &mdash; {rep.type}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="success-next-steps">
        <h4>What happens next?</h4>
        <ol>
          <li>Your {repWord} will receive your letter directly by email.</li>
          <li>
            Any reply will go straight to <strong>{senderEmail}</strong> — keep
            an eye on your inbox, including your spam folder.
          </li>
          <li>
            Response times vary. Most {repWord} aim to reply within two to four
            weeks, though it can take longer during busy parliamentary periods.
          </li>
          <li>
            If you don&apos;t hear back, you can follow up or contact your{" "}
            {repWord} directly through their official website.
          </li>
        </ol>
      </div>

      <div className="step-buttons success-step-buttons">
        <button
          className="button button-primary"
          onClick={onStartOver}
          type="button"
        >
          Start over
        </button>
      </div>
    </div>
  );
};
