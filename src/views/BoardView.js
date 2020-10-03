import React from "react";
import styled from "styled-components";

import { SHOW_WELCOME } from "../utils/settings";
import BoardMenu from "../components/BoardMenu";
import BoardMenuEdit from "../components/BoardMenuEdit";
import GameController from "../components/GameController";
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
import { useGame } from "../hooks/useGame";

const StyledBoardView = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #202b38;
`;

export const BoardView = ({ namespace, edit: editMode = false }) => {
  const { currentUser, users } = useUsers();
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(editMode);

  const { gameLoaded } = useGame();

  return (
    <StyledBoardView>
      <NavBar
        setMenuOpen={setMenuOpen}
        setShowHelpModal={setShowHelpModal}
        setShowInfoModal={setShowInfoModal}
        setEditMode={setEdit}
        edit={edit}
      />
      {!editMode && (
        <BoardMenu
          isOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          setShowLoadGameModal={setShowLoadGameModal}
          edit={edit}
        />
      )}
      {editMode && (
        <BoardMenuEdit
          isOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          setShowLoadGameModal={setShowLoadGameModal}
          edit={edit}
        />
      )}
      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      <LoadGameModal
        showModal={showLoadGameModal}
        setShowModal={setShowLoadGameModal}
      />

      <SubscribeUserEvents />
      <AutoSave />
      {gameLoaded && (
        <BoardContainer>
          {!editMode && <UserList />}
          <ImageDropNPaste namespace={namespace}>
            <Board
              user={currentUser}
              users={users}
              getComponent={getComponent}
            />
          </ImageDropNPaste>
          <SelectedItemsPane edit={edit} />
          {edit && <GameController />}
        </BoardContainer>
      )}
    </StyledBoardView>
  );
};

export default BoardView;
