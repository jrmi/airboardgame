import React from 'react';
import { useRecoilState, atom } from 'recoil';
import Item from '../components/Item';
import { useC2C } from '../hooks/useC2C';

export const ItemListAtom = atom({
  key: 'itemList',
  default: [],
});

const Items = ({}) => {
  const [c2c] = useC2C();
  const [itemList, setItemList] = useRecoilState(ItemListAtom);

  const updateItem = React.useCallback(
    (id, callbackOrItem, sync = true) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === 'object') {
        callback = (item) => callbackOrItem;
      }
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (item.id === id) {
            const newItem = {
              ...callback(item),
              id: item.id, // Prevent id modification
            };
            sync && c2c.publish(`itemStateUpdate.${id}`, newItem);
            return newItem;
          }
          return item;
        });
      });
    },
    [setItemList, c2c]
  );

  return itemList.map((item) => (
    <Item key={item.id} state={item} setState={updateItem} />
  ));
};

export default Items;
