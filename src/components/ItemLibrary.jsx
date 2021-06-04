import React, { memo } from "react";
import { nanoid } from "nanoid";
import { useRecoilCallback } from "recoil";

import { useItems } from "../components/Board/Items";
import useToggle from "../hooks/useToggle";
import Chevron from "../ui/Chevron";
import { PanZoomRotateAtom } from "./Board";

import styled from "styled-components";
import { search } from "../utils";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

const StyledItemList = styled.ul`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  & li.group {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0 0.5em;
    flex-basis: 100%;
  }
  overflow: visible;
`;

const StyledItem = styled.li`
  display: block;
  padding: 0.5em;
  margin: 0.2em;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    max-width: 80px;
    & > span {
      margin-top: 0.2em;
      text-align: center;
      max-width: 80px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0.2em 0.5em;
    }
  }
  &:hover > div > span {
    z-index: 2;
    max-width: none;
    overflow: visible;
    background-color: #222;
    box-shadow: 0px 3px 6px #00000029;
  }
`;

const size = 60;

const NewItem = memo(({ type, template, component: Component, name }) => {
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        ...template,
        x: centerX,
        y: centerY,
        id: nanoid(),
        type,
      });
    },
    [pushItem, template, type]
  );

  return (
    <>
      <StyledItem onClick={addItem}>
        <div>
          <Component {...template} width={size} height={size} size={size} />
          <span>{name}</span>
        </div>
      </StyledItem>
    </>
  );
});

NewItem.displayName = "NewItem";

const SubItemList = ({ name, items }) => {
  const { t } = useTranslation();
  const [open, toggleOpen] = useToggle(false);
  const { pushItem } = useItems();

  const addItems = useRecoilCallback(
    ({ snapshot }) => async (items) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      items.forEach(({ template }, index) => {
        pushItem({
          ...template,
          x: centerX + 2 * index,
          y: centerY + 2 * index,
          id: nanoid(),
        });
      });
    },
    [pushItem]
  );

  return (
    <>
      <h3 onClick={toggleOpen} style={{ cursor: "pointer" }}>
        {open ? (
          <Chevron orientation="bottom" color="#8c8c8c" />
        ) : (
          <Chevron color="#8c8c8c" />
        )}{" "}
        {name}{" "}
        <span
          style={{ fontSize: "0.6em" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItems(items);
          }}
        >
          [{t("Add all")}]
        </span>
      </h3>
      {open && <ItemList items={items} />}
    </>
  );
};

const ItemList = ({ items }) => {
  return (
    <StyledItemList>
      {items.map((node) => {
        if (node.type) {
          return <NewItem {...node} key={node.uid} />;
        } else {
          // it's a group
          return (
            <li key={`group_${node.name}`} className="group">
              <SubItemList {...node} />
            </li>
          );
        }
      })}
    </StyledItemList>
  );
};

const MemoizedItemList = memo(ItemList);

const filterItems = (filter, nodes) => {
  return nodes.reduce((acc, node) => {
    if (node.type) {
      if (search(filter, node.name)) {
        acc.push(node);
      }
      return acc;
    } else {
      const filteredItems = filterItems(filter, node.items);
      if (filteredItems.length) {
        acc.push({ ...node, items: filteredItems });
      }
      return acc;
    }
  }, []);
};

const ItemLibrary = ({ items }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState(items);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilterItems = React.useCallback(
    debounce((filter, items) => {
      setFilteredItems(filterItems(filter, items));
    }, 500),
    []
  );

  React.useEffect(() => {
    debouncedFilterItems(filter, items);
  }, [debouncedFilterItems, filter, items]);

  return (
    <>
      <input
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1em" }}
        placeholder={t("Search...")}
      />
      <MemoizedItemList items={filteredItems} />
    </>
  );
};

export default memo(ItemLibrary);
