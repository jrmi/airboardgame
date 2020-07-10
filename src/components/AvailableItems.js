import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";
import { AvailableItemListAtom } from "./Board/game/atoms";

const AvailableItem = memo(({ data }) => {
  const { label } = data;
  const { pushItem } = useItems();

  const onClickHandler = () => {
    pushItem({ ...data, x: 200, y: 50, id: nanoid() });
  };

  return (
    <span style={{ cursor: "pointer" }} onClick={onClickHandler}>
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
