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
import HintOnLockedItem from "./HintOnLockedItem";
import useGlobalConf from "../../hooks/useGlobalConf";

export const BoardView = ({
  mediaLibraries,
  edit: editMode,
  itemLibraries,
}) => {
  const { isMaster } = useWire("board");
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode && isMaster
  );

  const [boardConfig] = useBoardConfig();

  const [moveFirst, setMoveFirst] = React.useState(false);
  const [hideMenu, setHideMenu] = React.useState(false);
  const { editItem, setEditItem } = useGlobalConf();

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
          showResizeHandle={editItem}
        />
        <NavBar editMode={editMode} />
        <ActionBar
          editMode={editMode}
          BoardFormComponent={BoardForm}
          itemLibraries={itemLibraries}
          moveFirst={moveFirst}
          setMoveFirst={setMoveFirst}
          hideMenu={hideMenu}
          setHideMenu={setHideMenu}
        />
        <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      </ImageDropNPaste>
      <SelectedItemsPane
        hideMenu={hideMenu}
        showEdit={editItem}
        setShowEdit={setEditItem}
      />
      <HintOnLockedItem />
    </MediaLibraryProvider>
  );
};

export default BoardView;
