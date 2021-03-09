import React from "react";
import useLocalStorage from "../../../hooks/useLocalStorage";

export const useGameStorage = () => {
  const [gameLocalSave, setGameLocalSave] = useLocalStorage("savedGame", {});

  React.useEffect(() => {});

  return [gameLocalSave, setGameLocalSave];
};

export default useGameStorage;
