import React from "react";

const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      if (!item) {
        // If missing we add it
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...

  // ... persists the new value to localStorage.

  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState

      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state

      setStoredValue(valueToStore);

      // Save to local storage

      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  React.useEffect(() => {
    const localStorageChanged = (e) => {
      if (e.key === key) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", localStorageChanged);
    return () => {
      window.removeEventListener("storage", localStorageChanged);
    };
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage;
