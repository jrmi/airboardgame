import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { SHOW_WELCOME } from "../../utils/settings";
import { Board } from "../../components/Board";
import SelectedItemsPane from "../../components/SelectedItemsPane";
import { useUsers } from "../../components/users";
import Touch from "../../ui/Touch";
import useC2C from "../../hooks/useC2C";

import WelcomeModal from "./WelcomeModal";
import { MediaLibraryProvider } from "../../components/mediaLibrary";
import AutoSaveSession from "../../components/AutoSaveSession";
import ImageDropNPaste from "../../components/ImageDropNPaste";
import AddItemButton from "../../components/AddItemButton";
import { MessageButton } from "../../components/Message";
import { insideClass } from "../../utils";

import NavBar from "./NavBar";

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
  width: 100%;
  text-shadow: 1px 1px 2px #222;
  font-size: 0.8em;
  pointer-events: none;
  & > *:not(.spacer) {
    padding: 0 1.5em;
    pointer-events: all;
  }

  & .spacer {
    flex: 1;
  }

  @media screen and (max-width: 640px) {
    & > * {
      padding: 0 0.5em;
    }
    & .spacer {
      padding: 0;
    }
  }

  @media screen and (max-width: 420px) {
    & > * {
      padding: 0 0.2em;
    }
  }
`;

export const BoardView = ({
  edit: editMode = false,
  mediaLibraries,
  getComponent,
}) => {
  const { t } = useTranslation();
  const { currentUser, localUsers: users } = useUsers();
  const { isMaster } = useC2C("board");

  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode && isMaster
  );

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);

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
      <MediaLibraryProvider libraries={mediaLibraries}>
        <NavBar editMode={editMode} />
        <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
        {!editMode && <AutoSaveSession />}
        <BoardContainer>
          <ImageDropNPaste>
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
        <ActionBar>
          {!editMode && <MessageButton />}
          <div className="spacer" />
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
          />
          <Touch
            onClick={() => setHideMenu((prev) => !prev)}
            alt={hideMenu ? t("Show menu") : t("Hide menu")}
            label={hideMenu ? t("Show menu") : t("Hide menu")}
            title={hideMenu ? t("Show action menu") : t("Hide action menu")}
            icon={hideMenu ? "eye-with-line" : "eye"}
          />
          <div className="spacer" />
          <AddItemButton />
        </ActionBar>
      </MediaLibraryProvider>
    </StyledBoardView>
  );
};

export default BoardView;
