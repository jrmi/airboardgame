import React from "react";
import { Item } from "./Item";
import useItems from "./useItems";
import { ItemListAtom } from "../";
import { useRecoilValue } from "recoil";

const ItemList = () => {
  const { updateItem } = useItems();
  const itemList = useRecoilValue(ItemListAtom);

  return itemList.map((item) => (
    <Item key={item.id} itemId={item.id} setState={updateItem} />
  ));
};

export default ItemList;
