import { atom, atomFamily, selector } from "recoil";

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

export const ItemsFamily = atomFamily({
  key: "Items",
  default: () => {},
});

export const AllItemsSelector = selector({
  key: "AllItemsSelector",
  get: ({ get }) => get(ItemListAtom).map(({ id }) => get(ItemsFamily(id))),
});

export default {
  ItemListAtom,
  BoardConfigAtom,
  AvailableItemListAtom,
  ItemsFamily,
  AllItemsSelector,
};
