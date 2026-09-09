import React from "react";
import { createInterpolateElement } from "@wordpress/element";
import { __, _n, sprintf } from "@wordpress/i18n";
import type { SelectableRepresentative } from "../types";

interface SelectStepProps {
  postcode: string;
  representatives: SelectableRepresentative[];
  selectedRepresentatives: SelectableRepresentative[];
  onChange: (representatives: SelectableRepresentative[]) => void;
  onContinue: () => void;
  onRestart: () => void;
}

function getRepresentativeKey(
  representative: SelectableRepresentative,
): string {
  return `${representative.type}-${representative.id}`;
}

function getRepresentativeTypeLabel(type: SelectableRepresentative["type"]): string {
  switch (type) {
    case "MP":
      return __("Member of Parliament", "find-my-rep");
    case "MS":
      return __("Member of the Senedd", "find-my-rep");
    case "PCC":
      return __("Police and Crime Commissioner", "find-my-rep");
    case "Councillor":
      return __("Local Councillor", "find-my-rep");
  }
}

function getRepresentativeContext(
  representative: SelectableRepresentative,
): string {
  switch (representative.type) {
    case "MP":
    case "MS":
      return representative.constituency || "";
    case "PCC":
      return representative.force || representative.area || "";
    case "Councillor":
      return [representative.ward, representative.council]
        .filter(Boolean)
        .join(", ");
  }
}

export const SelectStep: React.FC<SelectStepProps> = ({
  postcode,
  representatives,
  selectedRepresentatives,
  onChange,
  onContinue,
  onRestart,
}) => {
  const selectedKeys = new Set(selectedRepresentatives.map(getRepresentativeKey));

  const handleChange = (representative: SelectableRepresentative) => {
    const key = getRepresentativeKey(representative);

    if (selectedKeys.has(key)) {
      onChange(
        selectedRepresentatives.filter(
          (selectedRepresentative) =>
            getRepresentativeKey(selectedRepresentative) !== key,
        ),
      );
      return;
    }

    onChange(
      representatives.filter(
        (candidate) =>
          selectedKeys.has(getRepresentativeKey(candidate)) ||
          getRepresentativeKey(candidate) === key,
      ),
    );
  };

  return (
    <section className="find-my-rep-step step-select">
      <div className="selection-header">
        <h3>
          {createInterpolateElement(
            sprintf(
              /* translators: 1: postcode, 2: number of representatives. */
              _n(
                "For postcode <strong>%1$s</strong> you have %2$d representative available to contact:",
                "For postcode <strong>%1$s</strong> you have %2$d representatives available to contact:",
                representatives.length,
                "find-my-rep",
              ),
              postcode,
              representatives.length,
            ),
            { strong: <strong /> },
          )}
        </h3>
        <button
          className="button back-btn restart-btn"
          onClick={onRestart}
          type="button"
        >
          {__("Restart", "find-my-rep")}
        </button>
      </div>

      <div className="representatives-list selection-list">
        {representatives.map((representative) => {
          const key = getRepresentativeKey(representative);
          const context = getRepresentativeContext(representative);

          return (
            <div
              key={key}
              className={`representative-item rep-type-${representative.type.toLowerCase()}`}
            >
              <input
                type="checkbox"
                id={`rep-${key}`}
                checked={selectedKeys.has(key)}
                onChange={() => handleChange(representative)}
              />
              <label htmlFor={`rep-${key}`}>
                <span className="rep-type-title">
                  {getRepresentativeTypeLabel(representative.type)}
                </span>
                {context && <span className="rep-context">{context}</span>}
                <span className="rep-details">
                  <strong>{representative.name}</strong>
                  {representative.party && (
                    <span className="rep-party">{representative.party}</span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
        
      </div>
      <p className="selection-intro">
        {__(
          "You can uncheck anyone you don't want to contact.",
          "find-my-rep",
        )}
      </p>
      <div className="step-buttons selection-actions">
        <button
          className="button button-primary continue-btn"
          onClick={onContinue}
          disabled={selectedRepresentatives.length === 0}
          type="button"
        >
          {__("Next", "find-my-rep")}
        </button>
      </div>
    </section>
  );
};