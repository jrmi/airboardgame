import { useRecoilValue } from "recoil";

import { AvailableItemListAtom, BoardConfigAtom } from "./atoms";

import useLocalStorage from "../../../hooks/useLocalStorage";
//import useLocalStorage from 'react-use-localstorage';

import { useItems } from "../Items";

export const useGameStorage = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const boardConfig = useRecoilValue(BoardConfigAtom);
  const { itemList } = useItems();

  const [gameLocalSave, setGameLocalSave] = useLocalStorage("savedGame", {
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  });

  return [gameLocalSave, setGameLocalSave];
};

export default useGameStorage;
