import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Field, Form } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { expect, it, vi } from "vitest";
import AutoSave from "./AutoSave";

it("ignores field initialization but saves user edits including returning to zero", () => {
  const save = vi.fn();
  render(
    <Form onSubmit={() => {}} initialValues={{}}>
      {() => (
        <>
          <Field name="rotation" initialValue={0}>
            {({ input }) => <input aria-label="rotation" {...input} />}
          </Field>
          <AutoSave save={save} guardRotationInitialization />
        </>
      )}
    </Form>
  );
  expect(save).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("rotation"), {
    target: { value: "45" },
  });
  expect(save).toHaveBeenLastCalledWith({ rotation: "45" });
  fireEvent.change(screen.getByLabelText("rotation"), {
    target: { value: "0" },
  });
  expect(save).toHaveBeenLastCalledWith({ rotation: "0" });
});

it("saves action array additions, reordering, and removal made through mutators", () => {
  const save = vi.fn();
  render(
    <Form
      onSubmit={() => {}}
      initialValues={{ actions: [{ name: "rotate" }] }}
      mutators={arrayMutators}
    >
      {({ form }) => (
        <>
          <button
            onClick={() => form.mutators.push("actions", { name: "tap" })}
          >
            Add
          </button>
          <button onClick={() => form.mutators.swap("actions", 0, 1)}>
            Swap
          </button>
          <button onClick={() => form.mutators.remove("actions", 0)}>
            Remove
          </button>
          <AutoSave save={save} guardRotationInitialization />
        </>
      )}
    </Form>
  );
  fireEvent.click(screen.getByText("Add"));
  expect(save).toHaveBeenLastCalledWith({
    actions: [{ name: "rotate" }, { name: "tap" }],
  });
  fireEvent.click(screen.getByText("Swap"));
  expect(save).toHaveBeenLastCalledWith({
    actions: [{ name: "tap" }, { name: "rotate" }],
  });
  fireEvent.click(screen.getByText("Remove"));
  expect(save).toHaveBeenLastCalledWith({ actions: [{ name: "rotate" }] });
});
