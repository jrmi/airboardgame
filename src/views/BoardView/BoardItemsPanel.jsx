import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import debounce from "lodash.debounce";

import { useDebouncedItems, useBoardPosition } from "react-sync-board";

import { itemTemplates } from "../../gameComponents";
import { search } from "../../utils";

import NavButton from "../../ui/NavButton";
import SidePanel from "../../ui/SidePanel";

import { FiList } from "react-icons/fi";

const StyledList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledItemRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.4em;
  margin: 0.2em 0;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.08);
  }

  & > div.thumb {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
  }

  & > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const thumbSize = 26;
// Radius (in board units) used to frame the selected item when centering the view on it
const focusRadius = 300;

const getItemName = (item) =>
  item.name ||
  item.label ||
  item.text ||
  itemTemplates[item.type]?.name ||
  item.type;

const ItemRow = ({ item, onSelect }) => {
  const Component = itemTemplates[item.type]?.component;

  return (
    <StyledItemRow onClick={() => onSelect(item)}>
      <div className="thumb">
        {Component && (
          <Component
            {...item}
            width={thumbSize}
            height={thumbSize}
            size={thumbSize}
          />
        )}
      </div>
      <span>{getItemName(item)}</span>
    </StyledItemRow>
  );
};

const BoardItemsPanel = ({ open, onClose }) => {
  const { t } = useTranslation();
  const items = useDebouncedItems();
  const { zoomToExtent } = useBoardPosition();

  const [filter, setFilter] = React.useState("");
  const [filteredItems, setFilteredItems] = React.useState(items);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilterItems = React.useCallback(
    debounce((filterToApply, itemsToFilter) => {
      if (!filterToApply) {
        setFilteredItems(itemsToFilter);
        return;
      }
      setFilteredItems(
        itemsToFilter.filter((item) => search(filterToApply, getItemName(item)))
      );
    }, 300),
    []
  );

  React.useEffect(() => {
    debouncedFilterItems(filter, items);
  }, [debouncedFilterItems, filter, items]);

  const handleSelect = React.useCallback(
    (item) => {
      zoomToExtent({ x: item.x, y: item.y, radius: focusRadius });
    },
    [zoomToExtent]
  );

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={t("Board items")}
      width="25%"
    >
      <input
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1em" }}
        placeholder={t("Search...")}
      />
      <StyledList>
        {filteredItems.map((item) => (
          <ItemRow item={item} key={item.id} onSelect={handleSelect} />
        ))}
      </StyledList>
    </SidePanel>
  );
};

const BoardItemsButton = ({ showItemsPanel, setShowItemsPanel }) => {
  const { t } = useTranslation();

  return (
    <>
      <NavButton
        onClick={() => setShowItemsPanel((prev) => !prev)}
        alt={t("Board items")}
        title={t("Board items")}
        Icon={FiList}
      />
      <BoardItemsPanel
        open={showItemsPanel}
        onClose={() => setShowItemsPanel(false)}
      />
    </>
  );
};

export default BoardItemsButton;
