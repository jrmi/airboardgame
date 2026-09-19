import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ActionList from "./ActionList";

const actionMap = {
  rotate: {
    label: () => "Rotate",
  },
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (value) => value }),
}));

vi.mock("./useGameItemActions", () => ({
  default: () => ({ actionMap }),
}));

const renderActionList = (initialValue = []) =>
  render(
    <Form
      initialValues={{ actions: initialValue }}
      mutators={{ ...arrayMutators }}
      onSubmit={vi.fn()}
      render={() => (
        <ActionList
          name="actions"
          initialValue={initialValue}
          availableActions={["rotate"]}
        />
      )}
    />
  );

describe("ActionList", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an action after it is selected", async () => {
    const user = userEvent.setup();
    renderActionList();

    await user.selectOptions(screen.getByRole("combobox"), "rotate");

    expect(screen.getAllByText("Rotate")[0]).toBeInTheDocument();
  });

  it("accepts a raw action name while the field is being registered", () => {
    renderActionList(["rotate"]);

    expect(screen.getAllByText("Rotate")[0]).toBeInTheDocument();
  });
});
