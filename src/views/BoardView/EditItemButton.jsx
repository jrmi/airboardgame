import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import SidePanel from "../../ui/SidePanel";
import ItemFormFactory from "./ItemFormFactory";
import { useSelectedItems, useBoardState } from "react-sync-board";

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
`;

const EditItemButton = ({ ItemFormComponent, showEdit, setShowEdit }) => {
  const boardState = useBoardState();
  const selectedItems = useSelectedItems();
  const { t } = useTranslation();

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
        {!showEdit && (
          <img
            src="https://icongr.am/feather/edit.svg?size=32&color=ffffff"
            alt={t("Edit")}
          />
        )}
        {showEdit && (
          <img
            src="https://icongr.am/feather/edit.svg?size=32&color=db5034"
            alt={t("Edit")}
          />
        )}
      </button>
      <SidePanel
        key={selectedItems[0]}
        open={showEdit && !boardState.selecting}
        onClose={() => {
          setShowEdit(false);
        }}
        title={title}
        width="25%"
      >
        <CardContent>
          <ItemFormFactory ItemFormComponent={ItemFormComponent} />
        </CardContent>
      </SidePanel>
    </>
  );
};

export default EditItemButton;
