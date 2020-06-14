import React from 'react';

import { useRecoilState } from 'recoil';
import { ItemListAtom } from '../components/Items';
import { selectedItemsAtom } from '../components/Selector';
import { shuffle as shuffleArray } from '../utils';
import { useC2C } from '../hooks/useC2C';

export const SelectedItems = ({}) => {
  const [c2c] = useC2C();
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
            const newItem = {
              ...callback(item),
              id: item.id,
            };
            c2c.publish(`itemStateUpdate.${item.id}`, newItem);
            return newItem;
          }
          return item;
        });
      });
    },
    [c2c, setItemList]
  );

  const massUpdateItems = React.useCallback(
    (ids, callbackOrItem) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === 'object') {
        callback = (item) => callbackOrItem;
      }
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (ids.includes(item.id)) {
            const newItem = {
              ...callback(item),
              id: item.id,
            };
            c2c.publish(`itemStateUpdate.${item.id}`, newItem);
            return newItem;
          }
          return item;
        });
      });
    },
    [c2c, setItemList]
  );

  // Shuffle selection
  const shuffle = React.useCallback(() => {
    setItemList((prevItemList) => {
      const shuffledSelectedItems = shuffleArray(
        prevItemList.filter(({ id }) => selectedItems.includes(id))
      );

      const result = prevItemList.map((item) => {
        if (selectedItems.includes(item.id)) {
          const newItem = {
            ...shuffledSelectedItems.pop(),
            x: item.x,
            y: item.y,
          };
          c2c.publish(`itemStateUpdate.${newItem.id}`, newItem);
          return newItem;
        }
        return item;
      });

      c2c.publish(
        `updateItemListOrder`,
        result.map(({ id }) => id)
      );
      return result;
    });
  }, [c2c, setItemList, selectedItems]);

  // Align selection to center
  const align = React.useCallback(() => {
    // Compute
    const minMax = { min: {}, max: {} };
    minMax.min.x = Math.min(...selectedItemList.map(({ x }) => x));
    minMax.min.y = Math.min(...selectedItemList.map(({ y }) => y));
    minMax.max.x = Math.max(
      ...selectedItemList.map(({ x, actualWidth }) => x + actualWidth)
    );
    minMax.max.y = Math.max(
      ...selectedItemList.map(({ y, actualHeight }) => y + actualHeight)
    );

    const [newX, newY] = [
      (minMax.min.x + minMax.max.x) / 2,
      (minMax.min.y + minMax.max.y) / 2,
    ];

    massUpdateItems(selectedItems, (item) => ({
      ...item,
      x: newX - item.actualWidth / 2,
      y: newY - item.actualHeight / 2,
    }));
  }, [selectedItemList, selectedItems, massUpdateItems]);

  if (selectedItemList.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '1em',
        bottom: '1em',
        background: '#ffffff77',
        padding: '0.2em',
        maxHeight: '50vh',
        overflowY: 'scroll',
      }}
    >
      {selectedItems.length > 1 && (
        <div>
          <h2>{selectedItems.length} items selected</h2>
          <button onClick={shuffle}>Shuffle selection</button>
          <button onClick={align}>Align selection</button>
        </div>
      )}
      {selectedItems.length === 1 && (
        <ul
          style={{
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
                    updateItem(id, (item) => ({
                      ...item,
                      locked: !item.locked,
                    }))
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
      )}
    </div>
  );
};

export default SelectedItems;
