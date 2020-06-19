import React from "react";
import Item from "../components/Item";
import useItemList from "../hooks/useItemList";

const Items = () => {
  const { itemList, updateItem } = useItemList();

  return itemList.map((item) => (
    <Item key={item.id} state={item} setState={updateItem} />
  ));
};

export default Items;
