import React from "react";
import { nanoid } from "nanoid";
import { useSetRecoilState, useRecoilValue, atom } from "recoil";
import { ItemListAtom } from "./Items";

export const AvailableItemListAtom = atom({
  key: "availableItemList",
  default: [],
});

const AvailableItem = ({ data }) => {
  const { content } = data;
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

  return (
    <span onClick={onClickHandler}>
      {content ? content.slice(-20) : content}
    </span>
  );
};

const AvailableItems = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  return (
    <ul>
      {availableItemList.map((availableItem) => (
        <li key={availableItem.id}>
          <AvailableItem data={availableItem} />
        </li>
      ))}
    </ul>
  );
};

export default AvailableItems;
