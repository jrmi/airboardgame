import React from "react";

const useToggle = (defaultValue = true) => {
  const [value, setValue] = React.useState(defaultValue);
  const toggle = React.useCallback(() => {
    setValue((prev) => !prev);
  }, []);
  return [value, toggle];
};

export default useToggle;
