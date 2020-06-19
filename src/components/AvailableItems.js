import React from "react";
import { nanoid } from "nanoid";
import { useSetRecoilState, useRecoilValue, atom } from "recoil";
import { ItemListAtom } from "./Items";

export const AvailableItemListAtom = atom({
  key: "availableItemList",
  default: [],
});

const AvailableItem = ({ data }) => {
  const { label } = data;
  const setItemList = useSetRecoilState(ItemListAtom);

  const onClickHandler = () => {
    setItemList((oldItemList) => [
      ...oldItemList,
      {
        ...data,
        x: 200,
        y: 50,
        id: nanoid(),
      },
    ]);
  };

  return <span onClick={onClickHandler}>{label}</span>;
};

const AvailableItems = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  const groupIds = [...new Set(availableItemList.map((item) => item.groupId))];

  return (
    <>
      {groupIds.map((groupId) => {
        return (
          <div>
            <h3>{groupId}</h3>
            <ul style={{ textAlign: "left" }}>
              {availableItemList
                .filter((item) => item.groupId === groupId)
                .map((item) => (
                  <li>
                    <AvailableItem data={item} />
                  </li>
                ))}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default AvailableItems;
