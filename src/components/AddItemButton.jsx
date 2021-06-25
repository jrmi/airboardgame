import React from "react";
import { nanoid } from "nanoid";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import ItemLibrary from "./ItemLibrary";

import { AvailableItemListAtom } from "./Board/";

import Touch from "./ui/Touch";
import SidePanel from "./ui/SidePanel";

// Keep compatibility with previous availableItems shape
const migrateAvailableItemList = (old) => {
  const groupMap = old.reduce((acc, { groupId, ...item }) => {
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(item);
    return acc;
  }, {});
  return Object.keys(groupMap).map((name) => ({
    name,
    items: groupMap[name],
  }));
};

const adaptItem = (item, itemMap) => ({
  type: item.type,
  template: item,
  component: itemMap[item.type].component,
  name: item.name || item.label || item.text || itemMap[item.type].name,
  uid: nanoid(),
});

const adaptAvailableItems = (nodes, itemMap) => {
  return nodes.map((node) => {
    if (node.type) {
      return adaptItem(node, itemMap);
    } else {
      return { ...node, items: adaptAvailableItems(node.items, itemMap) };
    }
  });
};

const AddItemButton = ({ itemMap }) => {
  const { t } = useTranslation();

  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [tab, setTab] = React.useState("standard");

  const defaultItemLibrary = React.useMemo(
    () =>
      Object.keys(itemMap).map((key) => ({
        type: key,
        ...itemMap[key],
        uid: nanoid(),
      })),
    [itemMap]
  );

  const availableItemLibrary = React.useMemo(() => {
    let itemList = availableItemList;
    if (itemList.length && itemList[0].groupId) {
      itemList = migrateAvailableItemList(itemList);
    }
    return adaptAvailableItems(itemList, itemMap);
  }, [availableItemList, itemMap]);

  return (
    <>
      <Touch
        onClick={() => setShowAddPanel((prev) => !prev)}
        alt={t("Add item")}
        title={t("Add item")}
        label={t("Add")}
        icon={showAddPanel ? "cross" : "plus"}
      />
      <SidePanel
        open={showAddPanel}
        onClose={() => {
          setShowAddPanel(false);
        }}
        position="right"
        width="33%"
      >
        <nav className="tabs">
          {
            // eslint-disable-next-line
              <a
              onClick={() => setTab("standard")}
              className={tab === "standard" ? "active" : ""}
              style={{ cursor: "pointer" }}
            >
              {t("Standard")}
            </a>
          }
          {availableItemList && availableItemList.length > 0 && (
            // eslint-disable-next-line
              <a
              onClick={() => setTab("other")}
              className={tab === "other" ? "active" : ""}
              style={{ cursor: "pointer" }}
            >
              {t("Other")}
            </a>
          )}
        </nav>
        <section className="content">
          {tab === "standard" && <ItemLibrary items={defaultItemLibrary} />}
          {tab === "other" && <ItemLibrary items={availableItemLibrary} />}
        </section>
      </SidePanel>
    </>
  );
};

export default AddItemButton;
