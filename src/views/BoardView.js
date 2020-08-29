import React from "react";
import styled from "styled-components";

import { SHOW_WELCOME } from "../utils/settings";
import BoardMenu from "../components/BoardMenu";
import GameController from "../components/GameController";
import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";
import LoadGameModal from "../components/LoadGameModal";
import HelpModal from "./HelpModal";
import WelcomeModal from "./WelcomeModal";
import InfoModal from "./InfoModal";
import NavBar from "./NavBar";
import AutoSave from "../components/AutoSave";
import ImageDropNPaste from "../components/ImageDropNPaste";
import { getComponent } from "../components/boardComponents";

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
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(SHOW_WELCOME);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);

  return (
    <ImageDropNPaste>
      <SubscribeUserEvents />
      <SubscribeGameEvents />
      <AutoSave />
      <NavBar
        setMenuOpen={setMenuOpen}
        setShowHelpModal={setShowHelpModal}
        setShowInfoModal={setShowInfoModal}
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
        <Board user={currentUser} users={users} getComponent={getComponent} />
        <SelectedItemsPane edit={edit} />
        {edit && <GameController />}
        <LoadGameModal
          showModal={showLoadGameModal}
          setShowModal={setShowLoadGameModal}
        />
      </BoardContainer>

      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
    </ImageDropNPaste>
  );
};

export default BoardView;
