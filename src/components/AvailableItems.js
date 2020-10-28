import React, { memo } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";
import { AvailableItemListAtom, PanZoomRotateAtom } from "./Board";
import { useTranslation } from "react-i18next";

const AvailableItem = memo(({ data }) => {
  const { label } = data;
  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({ ...data, x: centerX, y: centerY, id: nanoid() });
    },
    [data, pushItem]
  );

  return (
    <span style={{ cursor: "pointer" }} onClick={addItem}>
      {label}
    </span>
  );
});

AvailableItem.displayName = "AvailableItem";

const AvailableItems = () => {
  const { t } = useTranslation();
  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const [filter, setFilter] = React.useState("");
  const { pushItem } = useItems();

  let items = availableItemList;
  if (filter.length) {
    items = availableItemList.filter(({ label }) =>
      label.toLowerCase().includes(filter.toLowerCase())
    );
  }

  const groupIds = React.useMemo(
    () => [...new Set(items.map((item) => item.groupId))],
    [items]
  );

  const addItems = useRecoilCallback(
    ({ snapshot }) => async (groupId) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      items
        .filter((item) => item.groupId === groupId)
        .forEach((data) => {
          pushItem({ ...data, x: centerX, y: centerY, id: nanoid() });
        });
    },
    [items, pushItem]
  );

  return (
    <>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1em" }}
      />
      {groupIds.map((groupId) => {
        return (
          <div key={groupId}>
            <details
              style={{ textAlign: "left", marginLeft: "10px" }}
              open={filter.length}
            >
              <summary style={{ cursor: "pointer" }}>
                {groupId}{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    addItems(groupId);
                  }}
                >
                  [{t("Add all")}]
                </span>
              </summary>
              <ul>
                {items
                  .filter((item) => item.groupId === groupId)
                  .map((item) => (
                    <li key={item.id}>
                      <AvailableItem data={item} />
                    </li>
                  ))}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

export default memo(AvailableItems);
