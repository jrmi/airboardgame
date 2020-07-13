import React, { memo } from "react";
import { nanoid } from "nanoid";
import { useRecoilCallback } from "recoil";

import { useItems } from "../components/Board/Items";
import { PanZoomRotateAtom } from "./Board";

import { itemMap } from "./Board/Items/Item/allItems";

const NewItem = memo(({ type }) => {
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    async (snapshot) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        ...itemMap[type].template,
        x: centerX,
        y: centerY,
        id: nanoid(),
        type,
      });
    },
    [pushItem]
  );

  return (
    <button
      className="button"
      style={{ display: "block", width: "100%" }}
      onClick={addItem}
    >
      {itemMap[type].label}
    </button>
  );
});

NewItem.displayName = "NewItem";

const NewItems = () => {
  return Object.keys(itemMap).map((type) => <NewItem type={type} key={type} />);
};

export default memo(NewItems);
