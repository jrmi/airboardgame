import React from "react";
import { Item } from "./Item";
import useItems from "./useItems";

const ItemList = () => {
  const { itemList, updateItem } = useItems();

  return itemList.map((item) => (
    <Item key={item.id} state={item} setState={updateItem} />
  ));
};

export default ItemList;
