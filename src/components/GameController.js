import React from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import AvailableItems from "./AvailableItems";
import NewItems from "./NewItems";
import BoardConfig from "./BoardConfig";

import { BoardConfigAtom, AvailableItemListAtom, ItemListAtom } from "./Board/";

const LeftPane = styled.div`
  position: absolute;
  left: 0.5em;
  top: 4em;
  bottom: 0.5em;
  background-color: #ffffff10;
  width: 20%;
  padding: 0.5em;
  text-align: center;
  overflow-y: scroll;
`;

const AvailableItemList = styled.div`
  margin-top: 2em;
  background-color: black;
  color: white;
  list-type: none;
`;

const Title = styled.h3``;

export const GameController = () => {
  const { t } = useTranslation();

  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const boardConfig = useRecoilValue(BoardConfigAtom);

  const logGame = useRecoilCallback(
    ({ snapshot }) => async () => {
      const itemList = await snapshot.getPromise(ItemListAtom);
      console.log(itemList);
    },
    []
  );

  if (Object.keys(boardConfig).length === 0) {
    return null;
  }

  return (
    <LeftPane>
      <div className="card">
        <header>
          <Title onClick={logGame}>{t("Board config")}</Title>
        </header>
        <section className="content">
          <BoardConfig />
        </section>
      </div>
      <div className="card">
        <header>
          <Title>{t("Add item")}</Title>
        </header>
        <section className="content">
          <NewItems />
          {availableItemList && availableItemList.length > 0 && (
            <AvailableItemList>
              <Title>{t("Box Content")}</Title>
              <AvailableItems />
            </AvailableItemList>
          )}
        </section>
      </div>
    </LeftPane>
  );
};

export default GameController;
