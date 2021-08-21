import React from "react";

import { Board, useC2C } from "react-sync-board";

import { SHOW_WELCOME } from "../../utils/settings";
import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import BoardForm from "./BoardForm";
import SelectedItemPane from "./SelectedItemsPane";

import { ItemForm, itemTemplates } from "../../gameComponents";

import ActionBar from "./ActionBar";

import { MediaLibraryProvider, ImageDropNPaste } from "../../mediaLibrary";

const style = {
  background:
    "radial-gradient(circle, hsla(218, 30%, 40%, 0.7), hsla(218, 40%, 40%, 0.05) 100%),  url(/board.png)",
  border: "1px solid transparent",
  borderRadius: "2px",
  boxShadow: "0px 3px 6px #00000029",
};

export const BoardView = ({ mediaLibraries, edit, itemLibraries }) => {
  const { isMaster } = useC2C("board");
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !edit && isMaster
  );

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);

  return (
    <MediaLibraryProvider libraries={mediaLibraries}>
      <ImageDropNPaste>
        <Board
          moveFirst={moveFirst}
          style={style}
          itemTemplates={itemTemplates}
        />
        <NavBar editMode={edit} />
        <ActionBar
          editMode={edit}
          BoardFormComponent={BoardForm}
          itemLibraries={itemLibraries}
          moveFirst={moveFirst}
          setMoveFirst={setMoveFirst}
          hideMenu={hideMenu}
          setHideMenu={setHideMenu}
        />
        <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      </ImageDropNPaste>
      <SelectedItemPane ItemFormComponent={ItemForm} hideMenu={hideMenu} />
    </MediaLibraryProvider>
  );
};

export default BoardView;
