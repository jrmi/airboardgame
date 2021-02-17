import React from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import AvailableItems from "./AvailableItems";
import NewItems from "./NewItems";

import { AvailableItemListAtom } from "./Board/";

import Touch from "../ui/Touch";
import SidePanel from "../ui/SidePanel";

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
      <Touch
        onClick={() => setShowAddPanel((prev) => !prev)}
        alt={t("Add item")}
        title={t("Add item")}
        label={t("Add")}
        icon={showAddPanel ? "cross" : "plus"}
        style={{ flex: 1 }}
      />
      {showAddPanel && (
        <SidePanel
          onClose={() => {
            setShowAddPanel(false);
          }}
          position="right"
        >
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
        </SidePanel>
      )}
    </>
  );
};

export default AddItemButton;
