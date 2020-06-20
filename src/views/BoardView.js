import React from "react";
import styled from "styled-components";

import GameController from "../components/GameController";
import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { Board } from "../components/Board";
import { AvailableItemListAtom } from "../components/AvailableItems";
import { useRecoilState } from "recoil";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";

const BoardContainer = styled.div`
  display: fixed;
  top: 0;
  left: 0;
  background-color: #282c34;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
`;

export const BoardView = () => {
  const { currentUser, users } = useUsers();
  const [availableItemList, setAvailableItemList] = useRecoilState(
    AvailableItemListAtom
  );
  const [boardConfig, setBoardConfig] = React.useState({});

  return (
    <BoardContainer>
      <SubscribeUserEvents />
      <SubscribeGameEvents
        availableItemList={availableItemList}
        setAvailableItemList={setAvailableItemList}
        boardConfig={boardConfig}
        setBoardConfig={setBoardConfig}
      />
      <Board user={currentUser} users={users} config={boardConfig} />
      <UserList />
      <SelectedItemsPane />
      <GameController
        availableItemList={availableItemList}
        boardConfig={boardConfig}
        //game={{ items: itemList, board: boardConfig }}
        //setGame={setGame}
      />
    </BoardContainer>
  );
};

export default BoardView;
