import React from "react";
import { useTranslation } from "react-i18next";

import Items from "./Items";
import Selector from "../components/Selector";
import ActionPane from "./ActionPane";
import CursorPane from "./CursorPane";

export const Board = ({ user, users, config }) => {
  const { t } = useTranslation();

  if (!config.size) {
    return (
      <p
        style={{
          position: "fixed",
          top: "40vh",
          width: "100vw",
          textAlign: "center",
        }}
      >
        {t("Please select or load a game")}
      </p>
    );
  }

  return (
    <Selector>
      <ActionPane>
        <CursorPane user={user} users={users}>
          <div
            className="content"
            style={{
              background:
                "repeating-linear-gradient(45deg, #606dbc60, #606dbc60 10px, #46529860 10px, #46529860 20px)",
              width: `${config.size}px`,
              height: `${config.size}px`,
            }}
          >
            <Items />
          </div>
        </CursorPane>
      </ActionPane>
    </Selector>
  );
};

export default Board;
