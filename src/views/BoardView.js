import React from "react";
import styled from "styled-components";

import { SHOW_WELCOME } from "../utils/settings";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents } from "../components/users";

import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import AutoSave from "../components/AutoSave";
import ImageDropNPaste from "../components/ImageDropNPaste";
import { getComponent } from "../components/boardComponents";
import { useGame } from "../hooks/useGame";
import AddItemButton from "../components/AddItemButton";

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
  background-color: var(--bg-color);
`;

export const BoardView = ({ namespace, edit: editMode = false }) => {
  const { currentUser, users } = useUsers();
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode
  );

  const { gameLoaded } = useGame();

  return (
    <StyledBoardView>
      <NavBar editMode={editMode} />
      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      <SubscribeUserEvents />
      <AutoSave />
      {gameLoaded && (
        <BoardContainer>
          <ImageDropNPaste namespace={namespace}>
            <Board
              user={currentUser}
              users={users}
              getComponent={getComponent}
            />
          </ImageDropNPaste>
          <SelectedItemsPane />
        </BoardContainer>
      )}
      <AddItemButton />
    </StyledBoardView>
  );
};

export default BoardView;
