import React from "react";

import { SHOW_WELCOME } from "../../utils/settings";
import { BoardWrapper, Board } from "react-sync-board";

import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import BoardForm from "./BoardForm";
import SelectedItemPane from "./SelectedItemsPane";

import { ItemForm } from "../../gameComponents";

import {
  uploadResourceImage,
  listResourceImage,
  deleteResourceImage,
} from "../../utils/api";
import ActionBar from "./ActionBar";

import {
  MediaLibraryProvider,
  ImageDropNPaste,
} from "../../components/mediaLibrary";
import AutoSaveSession from "../AutoSaveSession";

const mediaHandlers = {
  uploadMedia: uploadResourceImage,
  listMedia: listResourceImage,
  deleteMedia: deleteResourceImage,
};

const style = {
  background:
    "radial-gradient(circle, hsla(218, 30%, 40%, 0.7), hsla(218, 40%, 40%, 0.05) 100%),  url(/board.png)",
  border: "1px solid transparent",
  borderRadius: "2px",
  boxShadow: "0px 3px 6px #00000029",
};

export const BoardView = (props) => {
  // TODO open only for master
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !props.editMode
  );

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);

  return (
    <MediaLibraryProvider libraries={props.mediaLibraries} {...mediaHandlers}>
      <BoardWrapper
        {...props}
        mediaHandlers={mediaHandlers}
        BoardFormComponent={BoardForm}
        hideMenu={hideMenu}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <ImageDropNPaste>
          <Board moveFirst={moveFirst} style={style} />
          <NavBar editMode={props.edit} />
          <ActionBar
            editMode={props.edit}
            BoardFormComponent={BoardForm}
            itemLibraries={props.itemLibraries}
            moveFirst={moveFirst}
            setMoveFirst={setMoveFirst}
            hideMenu={hideMenu}
            setHideMenu={setHideMenu}
          />
          <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
        </ImageDropNPaste>

        <AutoSaveSession />
        <SelectedItemPane ItemFormComponent={ItemForm} />
      </BoardWrapper>
    </MediaLibraryProvider>
  );
};

export default BoardView;
