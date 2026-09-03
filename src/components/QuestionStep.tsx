import React from "react";
import { __ } from "@wordpress/i18n";

interface QuestionStepProps {
  question: string;
  response: string;
  onChange: (response: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  response,
  onChange,
  onContinue,
  onBack,
}) => (
  <div className="find-my-rep-step step-question">
    <h3>{question}</h3>
    <label htmlFor="question-response">
      {__("Your response (optional)", "find-my-rep")}
    </label>
    <textarea
      id="question-response"
      className="question-response"
      rows={6}
      maxLength={1000}
      value={response}
      onChange={(event) => onChange(event.target.value)}
    />
    <div className="step-buttons">
      <button className="button back-btn" onClick={onBack} type="button">
        <span aria-hidden="true">←</span> {__("Back", "find-my-rep")}
      </button>
      <button
        className="button button-primary continue-btn"
        onClick={onContinue}
        type="button"
      >
        {__("Continue", "find-my-rep")}
      </button>
    </div>
  </div>
);