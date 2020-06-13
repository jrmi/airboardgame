import React from 'react';

import { useRecoilState } from 'recoil';
import { ItemListAtom } from '../components/Items';
import { selectedItemsAtom } from '../components/Selector';

export const SelectedItems = ({}) => {
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsAtom);

  const selectedItemList = React.useMemo(() => {
    return itemList.filter(({ id }) => selectedItems.includes(id));
  }, [itemList, selectedItems]);

  const updateItem = React.useCallback(
    (id, callbackOrItem) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === 'object') {
        callback = (item) => callbackOrItem;
      }
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (item.id === id) {
            return {
              ...callback(item),
              id: item.id,
            };
          }
          return item;
        });
      });
    },
    [setItemList]
  );

  if (selectedItemList.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        position: 'fixed',
        right: '1em',
        bottom: '1em',
        background: '#ffffff77',
        padding: '0.2em',
        listStyle: 'none',
      }}
    >
      {selectedItemList.map(({ id, ...state }, index) => (
        <li key={id} style={{}}>
          <h2 style={{ lineHeight: '30px' }}>{index}</h2>
          <label>
            Locked:
            <input
              type='checkbox'
              checked={Boolean(state.locked)}
              onChange={(e) =>
                updateItem(id, (item) => ({ ...item, locked: !item.locked }))
              }
            />
          </label>
          <label>
            Rotation:
            <input
              type='number'
              value={state.rotation || 0}
              onChange={(e) =>
                updateItem(id, (item) => ({
                  ...item,
                  rotation: parseInt(e.target.value, 10),
                }))
              }
            />
          </label>
        </li>
      ))}
    </ul>
  );
};

export default SelectedItems;
