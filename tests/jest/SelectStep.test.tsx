import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SelectStep } from "../../src/components/SelectStep";
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
    type: "Councillor",
    id: 1,
    name: "Dylan Williams",
    email: "dylan@example.org",
    ward: "Cathays",
    council: "Cardiff Council",
  },
];

describe("SelectStep", () => {
  const defaultProps = {
    postcode: "CF10 1AA",
    representatives,
    selectedRepresentatives: representatives,
    onChange: jest.fn(),
    onContinue: jest.fn(),
    onRestart: jest.fn(),
  };

  test("renders all representatives selected and keeps Next visible outside the list", () => {
    render(<SelectStep {...defaultProps} />);

    expect(
      screen.getByRole("heading", {
        name: "For postcode CF10 1AA you have 2 representatives available to contact:",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("CF10 1AA").tagName).toBe("STRONG");
    screen.getAllByRole("checkbox").forEach((checkbox) =>
      expect(checkbox).toBeChecked(),
    );
    const list = screen.getByText("Alex Morgan").closest(".selection-list");
    const next = screen.getByRole("button", { name: "Next" });
    expect(list).not.toContainElement(next);
    expect(next).toBeEnabled();
  });

  test("deselects a representative using type and id as its identity", () => {
    const onChange = jest.fn();
    render(
      <SelectStep
        {...defaultProps}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("checkbox")[0]);

    expect(onChange).toHaveBeenCalledWith([representatives[1]]);
  });

  test("disables Next when every representative is deselected", () => {
    const onContinue = jest.fn();
    render(
      <SelectStep
        {...defaultProps}
        selectedRepresentatives={[]}
        onContinue={onContinue}
      />,
    );

    const next = screen.getByRole("button", { name: "Next" });
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(onContinue).not.toHaveBeenCalled();
  });

  test("uses singular wording and calls Restart", () => {
    const onRestart = jest.fn();
    render(
      <SelectStep
        {...defaultProps}
        representatives={[representatives[0]]}
        selectedRepresentatives={[representatives[0]]}
        onRestart={onRestart}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "For postcode CF10 1AA you have 1 representative available to contact:",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});