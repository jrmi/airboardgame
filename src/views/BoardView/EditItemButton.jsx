import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/browser";

import { FiEdit } from "react-icons/fi";

import SidePanel from "../../ui/SidePanel";
import ItemFormFactory from "./ItemFormFactory";
import {
  useItemActions,
  useSelectedItems,
  useDebouncedItems,
} from "react-sync-board";

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
`;

const EditItemButton = ({ showEdit, setShowEdit }) => {
  const { t } = useTranslation();

  const items = useDebouncedItems();
  const selectedItems = useSelectedItems();
  const { batchUpdateItems } = useItemActions();

  const currentItems = React.useMemo(() => {
    try {
      // FIXME why do we need to be so protective here
      return items.filter(({ id }) => selectedItems.includes(id));
    } catch (err) {
      console.log("Fail to compute item list", err);
      console.debug(
        "Debug:",
        typeof items,
        JSON.parse(JSON.stringify(selectedItems))
      );

      try {
        Sentry.captureException(err, {
          typeItems: typeof items,
          lastItems: items.slice(-4),
          selectedItems,
        });
      } catch {
        console.log("Sentry call failed");
      }

      return [];
    }
  }, [items, selectedItems]);

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      batchUpdateItems(selectedItems, (item) => {
        if (formValues.item) {
          // Merge subitem for generator
          return {
            ...item,
            ...formValues,
            item: { ...item.item, ...formValues.item },
          };
        } else {
          return { ...item, ...formValues };
        }
      });
    },
    [batchUpdateItems, selectedItems]
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
