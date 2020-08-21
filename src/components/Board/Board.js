import React from "react";
import { useTranslation } from "react-i18next";

import { ItemList, SubscribeItemEvents } from "./Items";
import Selector from "./Selector";
import ActionPane from "./ActionPane";
import CursorPane from "./Cursors/CursorPane";
import PanZoomRotate from "./PanZoomRotate";

import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { BoardConfigAtom } from "./game/atoms";

const Placeholder = styled.p`
  position: fixed;
  top: 40vh;
  width: 100vw;
  text-align: center;
  color: hsl(0, 0%, 70%);
`;

const StyledBoard = styled.div.attrs(() => ({ className: "board" }))`
  position: relative;
  background-image: url(/board.png);
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

export const Board = ({ user, users }) => {
  const { t } = useTranslation();

  const config = useRecoilValue(BoardConfigAtom);

  if (!config.size) {
    return <Placeholder>{t("Please select or load a game")}</Placeholder>;
  }

  return (
    <>
      <SubscribeItemEvents />
      <PanZoomRotate>
        <Selector>
          <ActionPane>
            <CursorPane user={user} users={users}>
              <StyledBoard size={config.size}>
                <ItemList />
              </StyledBoard>
            </CursorPane>
          </ActionPane>
        </Selector>
      </PanZoomRotate>
    </>
  );
};

export default Board;
