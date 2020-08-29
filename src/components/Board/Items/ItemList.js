import React from "react";
import Item from "./Item";
import useItems from "./useItems";
import { ItemListAtom, ItemMapAtom, selectedItemsAtom } from "../";
import { useRecoilValue } from "recoil";

const ItemList = ({ getComponent }) => {
  const { updateItem } = useItems();
  const itemList = useRecoilValue(ItemListAtom);
  const itemMap = useRecoilValue(ItemMapAtom);
  const selectedItems = useRecoilValue(selectedItemsAtom);

  return itemList.map((itemId) => (
    <Item
      key={itemId}
      state={itemMap[itemId]}
      setState={updateItem}
      isSelected={selectedItems.includes(itemId)}
      getComponent={getComponent}
    />
  ));
};

export default ItemList;
