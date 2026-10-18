import React from "react";
import { useTranslation } from "react-i18next";

import {
  Board,
  useUsers,
  useBoardConfig,
  useItems,
  useSelectedItems,
  useSetSelectedItems,
} from "react-sync-board";

import { SHOW_WELCOME } from "../../utils/settings";
import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import styled from "styled-components";
import SelectedItemsPane from "./SelectedItemsPane";
import ItemFinder from "./ItemFinder";

import { itemTemplates, backgrounds } from "../../gameComponents";

import { MediaLibraryProvider, ImageDropNPaste } from "../../mediaLibrary";
import HintOnLockedItem from "./HintOnLockedItem";
import useGlobalConf from "../../hooks/useGlobalConf";
import useSession from "../../hooks/useSession";
import useLocalStorage from "../../hooks/useLocalStorage";

import flipAudio from "../../media/audio/flip.ogg?url";
import rollAudio from "../../media/audio/roll.ogg?url";
import shuffleAudio from "../../media/audio/shuffle.ogg?url";
import { preloadAudio } from "../../utils";
import BoardGridOverlay from "../../gameComponents/GridOverlay";
import HeldItemRotationStyles from "./HeldItemRotationStyles";
import { canSeeItem } from "../../utils/itemVisibility";
import { useModeration } from "../../hooks/useModeration";

const StyledBoard = styled.div`
  & .item.locked::after {
    content: "";
    position: absolute;
    width: 24px;
    height: 30px;
    top: 4px;
    right: 4px;
    opacity: 0.1;
    user-select: none;
    overflow: hidden;
  }

  & .item.locked:hover::after {
    opacity: 0.3;
  }
`;

const preventNativeDrag = (event) => event.preventDefault();
const defaultInteraction = {
  navigationMode: "auto",
  primaryAction: "pan",
};

export const BoardView = ({
  mediaLibraries,
  edit: editMode,
  itemLibraries,
}) => {
  const { t } = useTranslation();
  const { isSpaceMaster: isMaster, currentUser } = useUsers();
  const items = useItems();
  const selectedItems = useSelectedItems();
  const setSelectedItems = useSetSelectedItems();
  const { state: moderationState, isModerator } = useModeration();
  const refereeView = isModerator && moderationState.refereeView;
  const { isVassalSession } = useSession();
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !editMode && isMaster && !isVassalSession
  );

  const [boardConfig] = useBoardConfig();
  const [hiddenOpacity] = useLocalStorage("hiddenItemOpacity", 0.28);

  const [interaction, setInteraction] = useLocalStorage(
    "boardInteraction",
    defaultInteraction
  );
  const [hideMenu, setHideMenu] = React.useState(false);
  const [showItemFinder, setShowItemFinder] = React.useState(false);
  const { editItem, setEditItem } = useGlobalConf();

  const style = React.useMemo(() => {
    const currentBackground =
      backgrounds.find(({ type }) => type === boardConfig.bgType) ||
      backgrounds.find(({ type }) => type === "default");
    return currentBackground.getStyle(boardConfig.bgConf);
  }, [boardConfig.bgConf, boardConfig.bgType]);

  const itemVisibilityStyles = React.useMemo(
    () =>
      items
        .map((item) => {
          const selector = `.item[data-id=${JSON.stringify(String(item.id))}]`;
          const visible = canSeeItem({
            item,
            userId: currentUser?.uid,
            board: boardConfig,
            refereeView,
          });
          const rules = [];
          if (!visible) rules.push("display: none !important;");
          if (item.hidden) {
            const brightness = Math.max(0.2, 1 - Number(hiddenOpacity) * 0.8);
            rules.push(
              `filter: grayscale(0.8) brightness(${brightness}) !important;`
            );
          }
          return rules.length ? `${selector} { ${rules.join(" ")} }` : "";
        })
        .filter(Boolean)
        .join("\n"),
    [boardConfig, currentUser?.uid, hiddenOpacity, items, refereeView]
  );

  React.useEffect(() => preloadAudio([flipAudio, shuffleAudio, rollAudio]), []);

  const boardItemTemplates = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(itemTemplates).map(([type, template]) => {
          const availableActions = template.availableActions;
          const defaultActions = template.defaultActions;
          return [
            type,
            {
              ...template,
              defaultActions: (item) => {
                const actions =
                  typeof defaultActions === "function"
                    ? defaultActions(item)
                    : defaultActions || [];
                return [
                  ...new Set([...(actions || []), "toggleGroupVisibility"]),
                ];
              },
              availableActions: (item) => {
                const actions =
                  typeof availableActions === "function"
                    ? availableActions(item)
                    : availableActions || [];
                return [...new Set([...actions, "toggleGroupVisibility"])];
              },
            },
          ];
        })
      ),
    []
  );

  React.useEffect(() => {
    const visibleItemIds = new Set(
      items
        .filter((item) =>
          canSeeItem({
            item,
            userId: currentUser?.uid,
            board: boardConfig,
            refereeView,
          })
        )
        .map(({ id }) => id)
    );
    const nextSelection = selectedItems.filter((id) => visibleItemIds.has(id));
    if (nextSelection.length !== selectedItems.length) {
      setSelectedItems(nextSelection);
    }
  }, [
    boardConfig,
    currentUser?.uid,
    items,
    refereeView,
    selectedItems,
    setSelectedItems,
  ]);

  return (
    <MediaLibraryProvider libraries={mediaLibraries}>
      <ImageDropNPaste>
        <StyledBoard onDragStart={preventNativeDrag}>
          <style>{itemVisibilityStyles}</style>
          <Board
            interaction={interaction}
            style={style}
            itemTemplates={boardItemTemplates}
            showResizeHandle={editItem}
          >
            <BoardGridOverlay />
            <HeldItemRotationStyles />
            <ItemFinder
              open={showItemFinder}
              onClose={() => setShowItemFinder(false)}
            />
          </Board>
        </StyledBoard>
        <NavBar
          editMode={editMode}
          itemLibraries={itemLibraries}
          interaction={interaction}
          setInteraction={setInteraction}
          hideMenu={hideMenu}
          setHideMenu={setHideMenu}
          showItemFinder={showItemFinder}
          setShowItemFinder={setShowItemFinder}
        />
        <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
        {moderationState.refereeView && (
          <div
            role="status"
            style={{
              position: "fixed",
              zIndex: 240,
              top: "56px",
              right: "0.75rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "4px",
              color: "white",
              background: "#8b1e1e",
              pointerEvents: "none",
            }}
          >
            {t("Referee view is active for {{name}}", {
              name: moderationState.moderatorName || t("Moderator"),
            })}
          </div>
        )}
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
