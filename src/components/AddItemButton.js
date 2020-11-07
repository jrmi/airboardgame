import React from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import AvailableItems from "./AvailableItems";
import NewItems from "./NewItems";

import { AvailableItemListAtom } from "./Board/";

const StyledButton = styled.div.attrs(() => ({
  className: "button clear icon-only primary",
}))`
  position: fixed;
  bottom: 4px;
  right: 4px;
`;

const AddItemPane = styled.div`
  position: absolute;
  right: 0.5em;
  top: 3.5em;
  bottom: 0.5em;
  background-color: var(--bg-secondary-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 20%;
  min-width: 280px;
  padding: 0.5em;
  text-align: center;
  overflow-y: scroll;
  & .tabs a {
    cursor: pointer;
  }
  & .close {
    position: absolute;
    top: 5px;
    right: 10px;
  }
`;

const AvailableItemList = styled.div`
  margin-top: 2em;
  color: white;
  list-type: none;
`;

const AddItemButton = () => {
  const { t } = useTranslation();

  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [tab, setTab] = React.useState("standard");

  return (
    <>
      <StyledButton onClick={() => setShowAddPanel((prev) => !prev)}>
        <img
          src={
            showAddPanel
              ? "https://icongr.am/feather/x-circle.svg?size=46&color=db5034"
              : "https://icongr.am/feather/plus-circle.svg?size=46&color=db5034"
          }
          alt={t("Add item")}
          title={t("Add item")}
        />
      </StyledButton>
      {showAddPanel && (
        <AddItemPane>
          <button
            className="button clear icon-only close"
            onClick={() => {
              setShowAddPanel(false);
            }}
          >
            <img
              src="https://icongr.am/feather/x.svg?size=30&color=ffffff"
              alt={t("Close")}
            />
          </button>
          <nav className="tabs">
            {
              // eslint-disable-next-line
              <a
                onClick={() => setTab("standard")}
                className={tab === "standard" ? "active" : ""}
              >
                {t("Standard")}
              </a>
            }
            {availableItemList && availableItemList.length > 0 && (
              // eslint-disable-next-line
              <a
                onClick={() => setTab("other")}
                className={tab === "other" ? "active" : ""}
              >
                {t("Other")}
              </a>
            )}
          </nav>
          <section className="content">
            {tab === "standard" && <NewItems />}
            {tab === "other" && (
              <AvailableItemList>
                <AvailableItems />
              </AvailableItemList>
            )}
          </section>
        </AddItemPane>
      )}
    </>
  );
};

export default AddItemButton;
