import { atom } from "recoil";

export const AvailableItemListAtom = atom({
  key: "availableItemList",
  default: [],
});

export const BoardConfigAtom = atom({
  key: "boardConfig",
  default: {},
});

export const ItemListAtom = atom({
  key: "itemList",
  default: [],
});

export default { ItemListAtom, BoardConfigAtom, AvailableItemListAtom };
