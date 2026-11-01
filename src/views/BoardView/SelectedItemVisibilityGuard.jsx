import React from "react";
import {
  useBoardConfig,
  useItems,
  useSelectedItems,
  useSetSelectedItems,
  useUsers,
} from "react-sync-board";

import { useModeration } from "../../hooks/useModeration";
import { canSeeItem } from "../../utils/teamVisibility";

const SelectedItemVisibilityGuard = () => {
  const items = useItems();
  const selectedItems = useSelectedItems();
  const setSelectedItems = useSetSelectedItems();
  const [boardConfig] = useBoardConfig();
  const { currentUser } = useUsers();
  const { state, isModerator } = useModeration();
  const refereeView = isModerator && state.refereeView;
  const selectedItemVisibility = React.useMemo(
    () =>
      selectedItems.map((id) => {
        const item = items.find((candidate) => candidate.id === id);
        return {
          id,
          exists: Boolean(item),
          visibleOnlyForTeam: item?.visibleOnlyForTeam,
        };
      }),
    [items, selectedItems]
  );
  const visibilityKey = JSON.stringify(selectedItemVisibility);
  const selectedItemVisibilityRef = React.useRef(selectedItemVisibility);
  selectedItemVisibilityRef.current = selectedItemVisibility;

  React.useEffect(() => {
    const nextSelection = selectedItemVisibilityRef.current
      .filter(
        ({ exists, visibleOnlyForTeam }) =>
          exists &&
          canSeeItem({
            item: { visibleOnlyForTeam },
            userId: currentUser?.uid,
            board: boardConfig,
            refereeView,
          })
      )
      .map(({ id }) => id);

    if (nextSelection.length !== selectedItems.length) {
      setSelectedItems(nextSelection);
    }
  }, [
    boardConfig,
    currentUser?.uid,
    refereeView,
    selectedItems,
    setSelectedItems,
    visibilityKey,
  ]);

  return null;
};

export default SelectedItemVisibilityGuard;
