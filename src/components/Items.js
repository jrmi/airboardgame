import React from 'react';
import { useRecoilState, atom, selector, useRecoilValue } from 'recoil';
import Item from '../components/Item';
import { selectedItemsAtom } from './Selector';

export const ItemListAtom = atom({
  key: 'itemList',
  default: [],
});

const Items = ({}) => {
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const selectedItems = useRecoilValue(selectedItemsAtom);

  const updateItemState = React.useCallback(
    (newState) => {
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (item.id === newState.id) {
            return { ...item, ...newState, id: item.id };
          }
          return item;
        });
      });
    },
    [setItemList]
  );

  return itemList.map((item) => (
    <Item key={item.id} state={item} setState={updateItemState} />
  ));
};

export default Items;
