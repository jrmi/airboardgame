import React, { memo } from "react";
import { nanoid } from "nanoid";
import { useRecoilCallback } from "recoil";

import { useItems } from "../components/Board/Items";
import { PanZoomRotateAtom } from "./Board";

import { itemMap } from "./boardComponents";

const NewItem = memo(({ type }) => {
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        ...itemMap[type].template,
        x: centerX,
        y: centerY,
        id: nanoid(),
        type,
      });
    },
    [pushItem, type]
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
