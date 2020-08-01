import { atom, selector } from "recoil";

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
export const ItemMapAtom = atom({
  key: "ItemMap",
  default: {},
});

export const AllItemsSelector = selector({
  key: "AllItemsSelector",
  get: ({ get }) => {
    const itemMap = get(ItemMapAtom);
    return get(ItemListAtom).map((id) => itemMap[id]);
  },
});

export default {
  ItemListAtom,
  BoardConfigAtom,
  AvailableItemListAtom,
  AllItemsSelector,
  ItemMapAtom,
};
