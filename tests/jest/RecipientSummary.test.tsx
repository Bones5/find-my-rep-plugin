import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecipientSummary } from "../../src/components/RecipientSummary";
import type { SelectableRepresentative } from "../../src/types";

const representatives: SelectableRepresentative[] = [
  {
    type: "MP",
    id: 1,
    name: "Alex Morgan",
    email: "alex@example.org",
    party: "Example Party",
    constituency: "Cardiff Central",
  },
  {
    type: "MS",
    id: 2,
    name: "Beth Evans",
    email: "beth@example.org",
    constituency: "South Wales Central",
  },
  {
    type: "MS",
    id: 5,
    name: "Elin Roberts",
    email: "elin@example.org",
    constituency: "South Wales Central",
  },
  {
    type: "PCC",
    id: 3,
    name: "Chris Jones",
    email: "chris@example.org",
    force: "South Wales Police",
  },
  {
    type: "Councillor",
    id: 4,
    name: "Dylan Williams",
    email: "dylan@example.org",
    ward: "Cathays",
    council: "Cardiff Council",
  },
];

describe("RecipientSummary", () => {
  test("confirms the postcode and every message recipient", () => {
    render(
      <RecipientSummary
        postcode="CF10 1AA"
        representatives={representatives}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Message recipients" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "For postcode CF10 1AA, we will send your message to the following 5 representatives:",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(4);
    expect(screen.getByText("1 Member of Parliament")).toBeInTheDocument();
    expect(screen.getByText("2 Members of the Senedd")).toBeInTheDocument();
    expect(
      screen.getByText("1 Police and Crime Commissioner"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 Local Councillor")).toBeInTheDocument();
    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("Beth Evans")).toBeInTheDocument();
    expect(screen.getByText("Elin Roberts")).toBeInTheDocument();
    expect(screen.getByText("Chris Jones")).toBeInTheDocument();
    expect(screen.getByText("Dylan Williams")).toBeInTheDocument();
    expect(screen.queryByText("Cardiff Central")).not.toBeInTheDocument();
    expect(screen.queryByText("South Wales Police")).not.toBeInTheDocument();
  });

  test("uses singular wording for one representative", () => {
    render(
      <RecipientSummary
        postcode="CF24 2NL"
        representatives={[representatives[0]]}
      />,
    );

    expect(
      screen.getByText(
        "For postcode CF24 2NL, we will send your message to the following 1 representative:",
      ),
    ).toBeInTheDocument();
  });

  test("reuses the previous representative card classes", () => {
    render(
      <RecipientSummary
        postcode="CF10 1AA"
        representatives={representatives}
      />,
    );

    expect(screen.getByText("Alex Morgan").closest("details")).toHaveClass(
      "representative-item",
      "rep-type-mp",
    );
    expect(screen.getByText("Beth Evans").closest("details")).toHaveClass(
      "rep-type-ms",
    );
    expect(screen.getByText("Chris Jones").closest("details")).toHaveClass(
      "rep-type-pcc",
    );
    expect(screen.getByText("Dylan Williams").closest("details")).toHaveClass(
      "rep-type-councillor",
    );
  });
});