import React from "react";
import styled from "styled-components";

import BoardMenu from "../components/BoardMenu";
import GameController from "../components/GameController";
import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";
import LoadGameModal from "../components/LoadGameModal";

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #202b38;
`;

export const BoardView = () => {
  const { currentUser, users } = useUsers();
  const [showModal, setShowModal] = React.useState(false);

  return (
    <BoardContainer>
      <BoardMenu setShowLoadGameModal={setShowModal} />
      <SubscribeUserEvents />
      <SubscribeGameEvents />
      <UserList />
      <Board user={currentUser} users={users} />
      <SelectedItemsPane />
      <GameController />
      <LoadGameModal showModal={showModal} setShowModal={setShowModal} />
    </BoardContainer>
  );
};

export default BoardView;
