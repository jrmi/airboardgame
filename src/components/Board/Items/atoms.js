import { atom } from "recoil";

const ItemListAtom = atom({
  key: "itemList",
  default: [],
});

export default ItemListAtom;
