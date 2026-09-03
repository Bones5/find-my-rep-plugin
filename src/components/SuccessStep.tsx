import React from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
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
  return (
    <div className="find-my-rep-step step-success">
      <div className="success-header">
        <span className="success-check-icon" aria-hidden="true" />
        <h3>{__("Your letter has been sent!", "find-my-rep")}</h3>
      </div>

      <p className="success-summary">{message}</p>

      {reps.length > 0 && (
        <div className="success-recipients">
          <h4>{__("Sent to:", "find-my-rep")}</h4>
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
        <h4>{__("What happens next?", "find-my-rep")}</h4>
        <ol>
          <li>
            {_n(
              "Your representative will receive your letter directly by email.",
              "Your representatives will receive your letter directly by email.",
              reps.length,
              "find-my-rep",
            )}
          </li>
          <li>
            {sprintf(
              /* translators: %s: sender email address. */
              __(
                "Any reply will go straight to %s — keep an eye on your inbox, including your spam folder.",
                "find-my-rep",
              ),
              senderEmail,
            )}
          </li>
          <li>
            {__(
              "Response times vary. Most representatives aim to reply within two to four weeks, though it can take longer during busy parliamentary periods.",
              "find-my-rep",
            )}
          </li>
          <li>
            {_n(
              "If you don't hear back, you can follow up or contact your representative directly through their official contact channels.",
              "If you don't hear back, you can follow up or contact your representatives directly through their official contact channels.",
              reps.length,
              "find-my-rep",
            )}
          </li>
        </ol>
      </div>

      <div className="step-buttons success-step-buttons">
        <button
          className="button button-primary"
          onClick={onStartOver}
          type="button"
        >
          {__("Start over", "find-my-rep")}
        </button>
      </div>
    </div>
  );
};
