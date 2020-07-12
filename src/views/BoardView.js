import React from "react";
import styled from "styled-components";

import BoardMenu from "../components/BoardMenu";
import GameController from "../components/GameController";
import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";
import LoadGameModal from "../components/LoadGameModal";
import HelpModal from "../components/HelpModal";
import WelcomeModal from "../components/WelcomeModal";
import NavBar from "../components/NavBar";

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #202b38;
`;

export const BoardView = () => {
  const { currentUser, users } = useUsers();
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);

  return (
    <>
      <SubscribeUserEvents />
      <SubscribeGameEvents />
      <NavBar
        setMenuOpen={setMenuOpen}
        setShowHelpModal={setShowHelpModal}
        setEditMode={setEdit}
        edit={edit}
      />
      <BoardMenu
        isOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setShowLoadGameModal={setShowLoadGameModal}
        edit={edit}
      />
      <BoardContainer>
        <UserList />
        <Board user={currentUser} users={users} />
        <SelectedItemsPane edit={edit} />
        {edit && <GameController />}
        <LoadGameModal
          showModal={showLoadGameModal}
          setShowModal={setShowLoadGameModal}
        />
        <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      </BoardContainer>

      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
    </>
  );
};

export default BoardView;
