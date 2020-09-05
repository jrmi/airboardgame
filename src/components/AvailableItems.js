import React, { memo } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";
import { AvailableItemListAtom, PanZoomRotateAtom } from "./Board";

const AvailableItem = memo(({ data }) => {
  const { label } = data;
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({ ...data, x: centerX, y: centerY, id: nanoid() });
    },
    [data, pushItem]
  );

  return (
    <span style={{ cursor: "pointer" }} onClick={addItem}>
      {label}
    </span>
  );
});

AvailableItem.displayName = "AvailableItem";

const AvailableItems = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  const groupIds = React.useMemo(
    () => [...new Set(availableItemList.map((item) => item.groupId))],
    [availableItemList]
  );

  return (
    <>
      {groupIds.map((groupId) => {
        return (
          <div key={groupId}>
            <details style={{ textAlign: "left", marginLeft: "10px" }}>
              <summary style={{ cursor: "pointer" }}>{groupId}</summary>
              <ul>
                {availableItemList
                  .filter((item) => item.groupId === groupId)
                  .map((item) => (
                    <li key={item.id}>
                      {item.id}
                      <AvailableItem data={item} />
                    </li>
                  ))}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

export default memo(AvailableItems);
