import React from "react";
import { useTranslation } from "react-i18next";

import Items from "./Items";
import Selector from "../components/Selector";
import ActionPane from "./ActionPane";
import CursorPane from "./CursorPane";
import ZoomPanRotate from "../components/PanZoomRotate";

import styled from "styled-components";

const Placeholder = styled.p`
  position: fixed;
  top: 40vh;
  width: 100vw;
  text-align: center;
`;

const StyledBoard = styled.div`
  position: relative;
  background: repeating-linear-gradient(
    45deg,
    #606dbc60,
    #606dbc60 10px,
    #46529860 10px,
    #46529860 20px
  );
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

export const Board = ({ user, users, config }) => {
  const { t } = useTranslation();

  if (!config.size) {
    return <Placeholder>{t("Please select or load a game")}</Placeholder>;
  }

  return (
    <ZoomPanRotate>
      <Selector>
        <ActionPane>
          <CursorPane user={user} users={users}>
            <StyledBoard size={config.size}>
              <Items />
            </StyledBoard>
          </CursorPane>
        </ActionPane>
      </Selector>
    </ZoomPanRotate>
  );
};

export default Board;
