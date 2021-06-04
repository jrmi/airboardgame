import React from "react";
import Item from "./Item";
import useItems from "./useItems";
import { ItemListAtom, ItemMapAtom, selectedItemsAtom } from "../";
import { useRecoilValue } from "recoil";

/** Allow to operate on locked items while u or l key is pressed  */
const useUnlock = () => {
  const [unlock, setUnlock] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "u" || e.key === "l") {
        setUnlock(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "u" || e.key === "l") {
        setUnlock(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return unlock;
};

const ItemList = ({ getComponent }) => {
  const { updateItem } = useItems();
  const itemList = useRecoilValue(ItemListAtom);
  const itemMap = useRecoilValue(ItemMapAtom);
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const unlocked = useUnlock();

  return itemList.map((itemId) => (
    <Item
      key={itemId}
      state={itemMap[itemId]}
      setState={updateItem}
      isSelected={selectedItems.includes(itemId)}
      unlocked={unlocked}
      getComponent={getComponent}
    />
  ));
};

export default ItemList;
