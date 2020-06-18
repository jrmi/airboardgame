import React from 'react';
import { nanoid } from 'nanoid';
import { useRecoilState, atom } from 'recoil';
import { ItemListAtom } from './Items';

export const AvailableItemListAtom = atom({
  key: 'availableItemList',
  default: [],
});

const AvailableItem = ({ data }) => {
  const { content } = data;
  const [itemList, setItemList] = useRecoilState(ItemListAtom);

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

const AvailableItems = ({}) => {
  const [availableItemList, setAvailableItemList] = useRecoilState(
    AvailableItemListAtom
  );

  return (
    <ul>
      {availableItemList.map((availableItem) => (
        <li>
          <AvailableItem key={availableItem.id} data={availableItem} />
        </li>
      ))}
    </ul>
  );
};

export default AvailableItems;
