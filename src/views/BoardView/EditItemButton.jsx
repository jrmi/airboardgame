import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { FiEdit } from "react-icons/fi";

import SidePanel from "../../ui/SidePanel";
import ItemFormFactory from "./ItemFormFactory";
import {
  useItemActions,
  useSelectedItems,
  useDebouncedItems,
} from "react-sync-board";
import useGameItemActions from "../../gameComponents/useGameItemActions";
import { getContinuousRotation, normalizeAngle } from "../../utils/item";

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
`;

const EditItemButton = ({ showEdit, setShowEdit }) => {
  const { t } = useTranslation();

  const items = useDebouncedItems();
  const selectedItems = useSelectedItems();
  const { batchUpdateItems, getItems } = useItemActions();
  const { computeHeldRotationUpdates } = useGameItemActions();

  const currentItems = React.useMemo(
    () =>
      items
        .filter((item) => item)
        .filter(({ id }) => selectedItems.includes(id)),
    [items, selectedItems]
  );

  const onSubmitHandler = React.useCallback(
    async (formValues) => {
      // The rotation field holds an absolute angle shared by all edited
      // items, so the delta to propagate to held items differs per item.
      // Compute it against each item's live rotation (getItems), not the
      // debounced `currentItems` snapshot -- during a fast slider drag the
      // debounced value lags behind, which would desync held items from
      // their holder's actual (always-absolute) new rotation.
      let heldUpdates = {};
      if (formValues.rotation !== undefined) {
        const liveItems = await getItems(currentItems.map(({ id }) => id));
        const requestedRotation = normalizeAngle(formValues.rotation);
        const rootAngles = Object.fromEntries(
          liveItems
            .filter((item) => item)
            .filter(
              (item) => normalizeAngle(item.rotation || 0) !== requestedRotation
            )
            .map((item) => [
              item.id,
              getContinuousRotation(item.rotation || 0, requestedRotation) -
                (item.rotation || 0),
            ])
        );
        heldUpdates = (await computeHeldRotationUpdates(rootAngles)).updates;
      }
      const heldIds = Object.keys(heldUpdates);

      batchUpdateItems(
        [...selectedItems, ...heldIds],
        (item) => {
          const isHeld = heldUpdates[item.id];
          const isExplicitlySelected = selectedItems.includes(item.id);
          const itemFormValues = !isExplicitlySelected
            ? {}
            : isHeld
              ? Object.fromEntries(
                  Object.entries(formValues).filter(
                    ([key]) => key !== "rotation"
                  )
                )
              : formValues;
          const rotation = isHeld
            ? getContinuousRotation(
                item.rotation || 0,
                heldUpdates[item.id].rotation
              )
            : itemFormValues.rotation === undefined
              ? undefined
              : normalizeAngle(item.rotation || 0) ===
                  normalizeAngle(itemFormValues.rotation)
                ? item.rotation
                : getContinuousRotation(
                    item.rotation || 0,
                    itemFormValues.rotation
                  );
          if (formValues.item) {
            // Merge subitem for generator
            return {
              ...item,
              ...itemFormValues,
              ...(isHeld ? heldUpdates[item.id] : {}),
              ...(rotation === undefined ? {} : { rotation }),
              item: { ...item.item, ...itemFormValues.item },
            };
          } else {
            return {
              ...item,
              ...itemFormValues,
              ...(isHeld ? heldUpdates[item.id] : {}),
              ...(rotation === undefined ? {} : { rotation }),
            };
          }
        },
        true
      );
    },
    [
      batchUpdateItems,
      getItems,
      selectedItems,
      currentItems,
      computeHeldRotationUpdates,
    ]
  );

  let title = "";
  if (selectedItems.length === 1) {
    title = t("Edit item");
  }
  if (selectedItems.length > 1) {
    title = t("Edit all items");
  }
  return (
    <>
      <button
        className="button clear icon-only"
        onClick={() => setShowEdit((prev) => !prev)}
        title={t("Edit")}
      >
        <FiEdit
          size="24"
          color={showEdit ? "#db5034" : "white"}
          alt={t("Edit")}
        />
      </button>
      <SidePanel
        key={selectedItems[0]}
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
        }}
        title={title}
        width="25%"
      >
        <CardContent>
          <ItemFormFactory onUpdate={onSubmitHandler} items={currentItems} />
        </CardContent>
      </SidePanel>
    </>
  );
};

export default EditItemButton;
