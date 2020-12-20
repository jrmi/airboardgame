import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

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

import { insideClass } from "../utils";

const StyledBoardView = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const BoardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--color-darkGrey);
`;

const FirstActionSelect = styled.button`
  position: fixed;
  bottom: 1em;
  left: 1em;
  background: none;
  border: 4px solid var(--color-primary);
  border-radius: 100%;
  padding: 0.5em;
`;

export const BoardView = ({ namespace, edit: editMode = false }) => {
  const { t } = useTranslation();
  const { currentUser, users } = useUsers();
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode
  );

  const [moveFirst, setMoveFirst] = React.useState(false);
  const { gameLoaded } = useGame();

  React.useEffect(() => {
    // Chrome-related issue.
    // Making the wheel event non-passive, which allows to use preventDefault() to prevent
    // the browser original zoom  and therefore allowing our custom one.
    // More detail at https://github.com/facebook/react/issues/14856
    const cancelWheel = (event) => {
      if (insideClass(event.target, "board")) event.preventDefault();
    };

    document.body.addEventListener("wheel", cancelWheel, { passive: false });

    return () => {
      document.body.removeEventListener("wheel", cancelWheel);
    };
  }, []);

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
              moveFirst={moveFirst}
            />
          </ImageDropNPaste>
          <SelectedItemsPane />
        </BoardContainer>
      )}
      <FirstActionSelect onClick={() => setMoveFirst((prev) => !prev)}>
        {!moveFirst && (
          <img
            src="https://icongr.am/feather/move.svg?size=24&color=db5034"
            alt={t("Move mode")}
            title={t("Switch to move mode")}
          />
        )}
        {moveFirst && (
          <img
            src="https://icongr.am/feather/mouse-pointer.svg?size=24&color=db5034"
            alt={t("Select mode")}
            title={t("Switch to select mode")}
          />
        )}
      </FirstActionSelect>
      <AddItemButton />
    </StyledBoardView>
  );
};

export default BoardView;
