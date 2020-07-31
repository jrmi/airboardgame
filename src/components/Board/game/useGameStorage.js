import useLocalStorage from "../../../hooks/useLocalStorage";
//import useLocalStorage from 'react-use-localstorage';

export const useGameStorage = () => {
  const [gameLocalSave, setGameLocalSave] = useLocalStorage("savedGame", {});

  return [gameLocalSave, setGameLocalSave];
};

export default useGameStorage;
