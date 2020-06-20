import React from "react";
import styled from "styled-components";

import GameController from "../components/GameController";
import Board from "../components/Board";
import { AvailableItemListAtom } from "../components/AvailableItems";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";
import { useRecoilState } from "recoil";
import SelectedItems from "../components/SelectedItems";
import { ItemsSubscription } from "../hooks/useItemList";

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
      <ItemsSubscription />
      <Board user={currentUser} users={users} config={boardConfig} />
      <UserList />
      <SelectedItems />
      <GameController
        availableItemList={availableItemList}
        setAvailableItemList={setAvailableItemList}
        boardConfig={boardConfig}
        setBoardConfig={setBoardConfig}
        //game={{ items: itemList, board: boardConfig }}
        //setGame={setGame}
      />
    </BoardContainer>
  );
};

export default BoardView;
