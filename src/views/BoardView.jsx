import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { SHOW_WELCOME } from "../utils/settings";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents } from "../components/users";
import Touch from "../ui/Touch";
import { useC2C } from "../hooks/useC2C";

import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import AutoSaveSession from "../components/AutoSaveSession";
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

const ActionBar = styled.div`
  position: fixed;
  bottom: 1em;
  right: 0em;
  display: flex;
  width: 40%;
  text-shadow: 1px 1px 2px #222;
  font-size: 0.8em;

  & .spacer {
    flex: 1;
  }

  @media screen and (max-width: 1024px) {
    & {
      width: 50%;
    }
  }

  @media screen and (max-width: 640px) {
    & {
      width: 80%;
    }
    & .spacer {
      flex: 0;
    }
  }
`;

export const BoardView = ({ namespace, edit: editMode = false, session }) => {
  const { t } = useTranslation();
  const { currentUser, users } = useUsers();
  const { isMaster } = useC2C();

  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode && isMaster
  );

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);
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
      {!editMode && <AutoSaveSession session={session} />}
      {gameLoaded && (
        <BoardContainer>
          <ImageDropNPaste namespace={namespace}>
            <Board
              user={currentUser}
              users={users}
              getComponent={getComponent}
              moveFirst={moveFirst}
              hideMenu={hideMenu}
            />
          </ImageDropNPaste>
          <SelectedItemsPane hideMenu={hideMenu} />
        </BoardContainer>
      )}
      <ActionBar>
        <Touch
          onClick={() => setMoveFirst(false)}
          alt={t("Select mode")}
          label={t("Select")}
          title={t("Switch to select mode")}
          icon={"mouse-pointer"}
          active={!moveFirst}
        />
        <Touch
          onClick={() => setMoveFirst(true)}
          alt={t("Move mode")}
          label={t("Move")}
          title={t("Switch to move mode")}
          icon={"hand"}
          active={moveFirst}
          style={{ flex: 1 }}
        />
        <Touch
          onClick={() => setHideMenu((prev) => !prev)}
          alt={hideMenu ? t("Show menu") : t("Hide menu")}
          label={hideMenu ? t("Show menu") : t("Hide menu")}
          title={hideMenu ? t("Show action menu") : t("Hide action menu")}
          icon={hideMenu ? "eye-with-line" : "eye"}
          style={{ flex: 1 }}
        />
        <div className="spacer" />
        <AddItemButton />
      </ActionBar>
    </StyledBoardView>
  );
};

export default BoardView;
