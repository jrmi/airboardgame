import React from "react";
import { useTranslation } from "react-i18next";

import { ItemList, SubscribeItemEvents } from "./Items";
import Selector from "./Selector";
import ActionPane from "./ActionPane";
import CursorPane from "./Cursors/CursorPane";
import PanZoomRotate from "./PanZoomRotate";

import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { BoardConfigAtom } from "./atoms";

/*

  #2C3749 - #13131B
  background: radial-gradient(circle, #2c3749, #13131b 100%), url(/board.png);
  background-blend-mode: multiply;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
  
*/

const Placeholder = styled.p`
  position: fixed;
  top: 40vh;
  width: 100vw;
  text-align: center;
  color: hsl(0, 0%, 70%);
`;

const StyledBoard = styled.div.attrs(() => ({ className: "board" }))`
  position: relative;
  background: radial-gradient(
      circle,
      hsla(218, 30%, 40%, 0.7),
      hsla(218, 40%, 40%, 0.05) 100%
    ),
    url(/board.png);

  border: 1px solid transparent;

  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  border-radius: 2px;

  box-shadow: 0px 3px 6px #00000029;
  user-select: none;
`;

export const Board = ({ user, users, itemMap, moveFirst = true }) => {
  const { t } = useTranslation();

  const config = useRecoilValue(BoardConfigAtom);

  if (!config.size) {
    return <Placeholder>{t("Please select or load a game")}</Placeholder>;
  }

  return (
    <>
      <SubscribeItemEvents />
      <PanZoomRotate moveFirst={moveFirst}>
        <Selector moveFirst={moveFirst}>
          <ActionPane>
            <CursorPane user={user} users={users}>
              <StyledBoard size={config.size}>
                <ItemList itemMap={itemMap} />
              </StyledBoard>
            </CursorPane>
          </ActionPane>
        </Selector>
      </PanZoomRotate>
    </>
  );
};

export default Board;
