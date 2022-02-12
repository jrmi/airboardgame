import React from "react";

import { Board, useWire, useBoardConfig } from "react-sync-board";

import { SHOW_WELCOME } from "../../utils/settings";
import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import BoardForm from "./BoardForm";
import SelectedItemsPane from "./SelectedItemsPane";

import { itemTemplates, backgrounds } from "../../gameComponents";

import ActionBar from "./ActionBar";

import { MediaLibraryProvider, ImageDropNPaste } from "../../mediaLibrary";

export const BoardView = ({ mediaLibraries, edit, itemLibraries }) => {
  const { isMaster } = useWire("board");
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !edit && isMaster
  );

  const [boardConfig] = useBoardConfig();

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);

  const style = React.useMemo(() => {
    const currentBackground =
      backgrounds.find(({ type }) => type === boardConfig.bgType) ||
      backgrounds.find(({ type }) => type === "default");
    return currentBackground.getStyle(boardConfig.bgConf);
  }, [boardConfig.bgConf, boardConfig.bgType]);

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
      <SelectedItemsPane hideMenu={hideMenu} />
    </MediaLibraryProvider>
  );
};

export default BoardView;
