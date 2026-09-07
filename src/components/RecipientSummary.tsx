import React from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
import type {
  RepresentativeType,
  SelectableRepresentative,
} from "../types";

interface RecipientSummaryProps {
  postcode: string;
  representatives: SelectableRepresentative[];
}

function getRepresentativeTypeLabel(
  type: RepresentativeType,
  count: number,
): string {
  switch (type) {
    case "MP":
      return _n(
        "Member of Parliament",
        "Members of Parliament",
        count,
        "find-my-rep",
      );
    case "MS":
      return _n(
        "Member of the Senedd",
        "Members of the Senedd",
        count,
        "find-my-rep",
      );
    case "PCC":
      return _n(
        "Police and Crime Commissioner",
        "Police and Crime Commissioners",
        count,
        "find-my-rep",
      );
    case "Councillor":
      return _n(
        "Local Councillor",
        "Local Councillors",
        count,
        "find-my-rep",
      );
  }
}

function groupRepresentatives(
  representatives: SelectableRepresentative[],
): [RepresentativeType, SelectableRepresentative[]][] {
  const groups = new Map<RepresentativeType, SelectableRepresentative[]>();

  representatives.forEach((representative) => {
    const group = groups.get(representative.type) || [];
    group.push(representative);
    groups.set(representative.type, group);
  });

  return Array.from(groups.entries());
}

export const RecipientSummary: React.FC<RecipientSummaryProps> = ({
  postcode,
  representatives,
}) => (
  <section className="find-my-rep-step recipient-summary">
    <h3>{__("Message recipients", "find-my-rep")}</h3>
    <p className="recipient-summary-intro">
      {sprintf(
        /* translators: 1: postcode, 2: number of representatives. */
        _n(
          "For postcode %1$s, we will send your message to the following %2$d representative:",
          "For postcode %1$s, we will send your message to the following %2$d representatives:",
          representatives.length,
          "find-my-rep",
        ),
        postcode,
        representatives.length,
      )}
    </p>
    <div className="representatives-list">
      {groupRepresentatives(representatives).map(([type, typeReps]) => {
        const typeLabel = getRepresentativeTypeLabel(type, typeReps.length);

        return (
          <details
            key={type}
            className={`representative-item rep-type-${type.toLowerCase()}`}
          >
            <summary className="rep-type-title">
              {sprintf(
                /* translators: 1: number of representatives, 2: representative type. */
                __("%1$d %2$s", "find-my-rep"),
                typeReps.length,
                typeLabel,
              )}
            </summary>
            <ul className="recipient-names">
              {typeReps.map((rep) => (
                <li key={`${rep.type}-${rep.id}`}>{rep.name}</li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  </section>
);