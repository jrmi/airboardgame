import React from "react";
import { useRecoilValue, atom } from "recoil";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";

export const AvailableItemListAtom = atom({
  key: "availableItemList",
  default: [],
});

const AvailableItem = ({ data }) => {
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
};

const AvailableItems = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  const groupIds = [...new Set(availableItemList.map((item) => item.groupId))];

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

export default AvailableItems;
