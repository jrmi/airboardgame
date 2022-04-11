import React from "react";
import { FormSpy } from "react-final-form";

const diff = (o1, o2) => {
  const keys = [...new Set([...Object.keys(o1), ...Object.keys(o2)])];
  const result = keys.reduce((diff, key) => {
    if (o1[key] === o2[key]) return diff;
    if (JSON.stringify(o1[key]) === JSON.stringify(o2[key])) return diff;
    return {
      ...diff,
      [key]: o2[key],
    };
  }, {});

  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
};

const AutoSaveIn = ({ values, save }) => {
  const [prevValues, setPrevValues] = React.useState(values);

  React.useEffect(() => {
    const differences = diff(prevValues, values);
    if (differences) {
      setPrevValues(values);
      save(differences);
    }
  }, [values, save, prevValues]);

  return null;
};

const AutoSave = (props) => (
  <FormSpy {...props} subscription={{ values: true }} component={AutoSaveIn} />
);

export default AutoSave;
