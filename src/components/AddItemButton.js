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
  top: 7em;
  bottom: 4em;
  background-color: var(--bg-secondary-color);
  width: 20%;
  padding: 0.5em;
  text-align: center;
  overflow-y: scroll;
  & .tabs a {
    cursor: pointer;
  }
`;

const AvailableItemList = styled.div`
  margin-top: 2em;
  background-color: black;
  color: white;
  list-type: none;
`;

const Title = styled.h3``;

const AddItemButton = () => {
  const { t } = useTranslation();

  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [tab, setTab] = React.useState("standard");

  return (
    <>
      <StyledButton onClick={() => setShowAddPanel((prev) => !prev)}>
        <img src="https://icongr.am/feather/plus-circle.svg?size=46&color=db5034" />
      </StyledButton>
      {showAddPanel && (
        <AddItemPane>
          <nav className="tabs">
            <a
              onClick={() => setTab("standard")}
              className={tab === "standard" ? "active" : ""}
            >
              Standard
            </a>
            {availableItemList && availableItemList.length > 0 && (
              <a
                onClick={() => setTab("other")}
                className={tab === "other" ? "active" : ""}
              >
                Other
              </a>
            )}
          </nav>
          <section className="content">
            {tab === "standard" && <NewItems />}
            {tab === "other" && (
              <AvailableItemList>
                <Title>{t("Box Content")}</Title>
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
