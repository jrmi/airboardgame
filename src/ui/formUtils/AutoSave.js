import React from "react";
import { FormSpy } from "react-final-form";

const AutoSaveIn = ({ values, save }) => {
  const [prevValues, setPrevValues] = React.useState(values);

  React.useEffect(() => {
    if (JSON.stringify(prevValues) !== JSON.stringify(values)) {
      setPrevValues(values);
      save(values);
    }
  }, [values, save, prevValues]);

  return null;
};

const AutoSave = (props) => (
  <FormSpy {...props} subscription={{ values: true }} component={AutoSaveIn} />
);

export default AutoSave;
