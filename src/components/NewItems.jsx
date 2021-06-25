import React, { memo } from "react";
import { nanoid } from "nanoid";
import { useRecoilCallback } from "recoil";
import styled from "styled-components";

import { useItems } from "./board/Items";
import { PanZoomRotateAtom } from "./board";
import { itemMap } from "./boardComponents";

const ItemList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-around;
`;

const Item = styled.div`
  padding: 1em;
  margin: 0.3em;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
  & > div {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
`;

const size = 70;

const NewItem = memo(({ type }) => {
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        ...itemMap[type].template,
        x: centerX,
        y: centerY,
        id: nanoid(),
        type,
      });
    },
    [pushItem, type]
  );

  const Component = itemMap[type].component;

  return (
    <>
      <Item onClick={addItem}>
        <div style={{ pointerEvents: "none" }}>
          <Component width={size} height={size} size={size} />
          <span>{itemMap[type].label}</span>
        </div>
      </Item>
    </>
  );
});

NewItem.displayName = "NewItem";

const NewItems = () => {
  return (
    <ItemList>
      {Object.keys(itemMap).map((type) => (
        <NewItem type={type} key={type} />
      ))}
    </ItemList>
  );
};

export default memo(NewItems);
