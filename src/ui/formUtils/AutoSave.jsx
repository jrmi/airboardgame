import React from "react";
import { FormSpy } from "react-final-form";
import { objectDiff } from "../../utils";

const AutoSaveIn = ({
  values,
  save,
  modified,
  guardRotationInitialization,
}) => {
  const [prevValues, setPrevValues] = React.useState(values);

  React.useEffect(() => {
    const differences = objectDiff(prevValues, values);
    if (differences) {
      setPrevValues(values);
      // Array mutators (adding/removing/reordering actions) do not mark
      // fields as modified. Only rotation needs an initialization guard.
      const changes = guardRotationInitialization
        ? Object.fromEntries(
            Object.entries(differences).filter(
              ([key]) => key !== "rotation" || modified?.rotation
            )
          )
        : differences;
      if (Object.keys(changes).length) save(changes);
    }
  }, [values, save, prevValues, modified, guardRotationInitialization]);

  return null;
};

const AutoSave = (props) => (
  <FormSpy
    {...props}
    subscription={{ values: true, modified: true }}
    component={AutoSaveIn}
  />
);

export default AutoSave;
