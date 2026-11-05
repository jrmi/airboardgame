import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  useBoardPosition,
  useItems,
  useSetSelectedItems,
  useBoardConfig,
  useUsers,
} from "react-sync-board";

import itemTemplates from "../../gameComponents/itemTemplates";
import { search } from "../../utils";
import { getImage } from "../../utils/image";
import { media2Url } from "../../mediaLibrary";
import SidePanel from "../../ui/SidePanel";
import { canSeeItem } from "../../utils/teamVisibility";
import { useModeration } from "../../hooks/useModeration";

const Preview = styled.div`
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;

  & > * {
    max-width: 64px;
    max-height: 64px;
  }
`;

const PreviewSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 8%,
    rgba(255, 255, 255, 0.2) 18%,
    rgba(255, 255, 255, 0.08) 33%
  );
  background-size: 200% 100%;
  animation: item-finder-shimmer 1.5s linear infinite;

  @keyframes item-finder-shimmer {
    to {
      background-position: -200% 0;
    }
  }
`;

const ResultSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75em;
  padding: 0.5em;
  min-height: 80px;
  box-sizing: border-box;

  .item-finder__preview-skeleton {
    width: 64px;
    height: 64px;
    flex: 0 0 64px;
  }

  .item-finder__name-skeleton {
    width: min(60%, 150px);
    height: 1em;
    border-radius: 0.25em;
  }
`;

const RESULTS_ROW_HEIGHT = 80;
const RESULTS_OVERSCAN = 4;
const VISIBLE_RESULTS = 12;

const Results = styled.div`
  flex: 1 1 0;
  min-height: 0;
  margin: 1em 0 0;
  padding: 0;
  overflow-y: auto;
`;

const ResultsContent = styled.div`
  position: relative;
`;

const Result = styled.div`
  position: absolute;
  left: 0;
  right: 0;

  [role="button"] {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75em;
    padding: 0.5em;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  [role="button"]:hover,
  [role="button"]:focus-visible {
    background: rgba(255, 255, 255, 0.12);
  }
`;

export const getItemDisplayName = (
  item,
  templates = itemTemplates,
  t = (value) => value
) =>
  item.label ||
  item.text ||
  t(
    templates[item.type]?.translationKey ||
      templates[item.type]?.name ||
      item.type
  );

export const getPreviewSize = (item) => {
  if (
    item.type !== "image" &&
    item.type !== "advancedImage" &&
    item.type !== "diceImage"
  ) {
    return { width: 64, height: 64, size: 64 };
  }

  const width = Number(item.width);
  const height = Number(item.height);

  if (Number.isFinite(width) && Number.isFinite(height)) {
    const scale = 64 / Math.max(width, height);
    return { width: width * scale, height: height * scale };
  }
  if (Number.isFinite(width)) return { width: 64 };
  if (Number.isFinite(height)) return { height: 64 };

  // Canvas derives the missing dimension from the image's natural aspect ratio.
  return { width: 64 };
};

export const getPreviewImageUrl = (item) => {
  if (item.type === "image") {
    return media2Url(
      item.flipped && item.backContent ? item.backContent : item.content
    );
  }
  if (item.type === "advancedImage") {
    return media2Url(item.flipped && item.back ? item.back : item.front);
  }
  if (item.type === "diceImage") {
    return media2Url(item.images?.[item.value || 0]);
  }
  return null;
};

const ItemResult = ({ item, onSelect, onKeyDown, t }) => {
  const Component = itemTemplates[item.type]?.component;
  const imageUrl = getPreviewImageUrl(item);
  const [loadedUrl, setLoadedUrl] = React.useState(null);

  React.useEffect(() => {
    if (!imageUrl) {
      setLoadedUrl(null);
      return undefined;
    }

    let active = true;
    setLoadedUrl(null);
    getImage(imageUrl)?.then(() => {
      if (active) setLoadedUrl(imageUrl);
    });

    return () => {
      active = false;
    };
  }, [imageUrl]);

  if (!Component) return null;

  const previewSize = getPreviewSize(item);
  const isLoading = imageUrl && loadedUrl !== imageUrl;

  if (isLoading) {
    return (
      <ResultSkeleton
        aria-busy="true"
        aria-label={getItemDisplayName(item, itemTemplates, t)}
      >
        <PreviewSkeleton className="item-finder__preview-skeleton" />
        <PreviewSkeleton className="item-finder__name-skeleton" />
      </ResultSkeleton>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => onKeyDown(event, item)}
    >
      <Preview aria-hidden="true">
        <Component {...item} {...previewSize} setState={() => {}} />
      </Preview>
      <span>{getItemDisplayName(item, itemTemplates, t)}</span>
    </div>
  );
};

const ItemFinder = ({ open, onClose }) => {
  const { t } = useTranslation();
  const items = useItems();
  const [boardConfig] = useBoardConfig();
  const { currentUser } = useUsers();
  const { state: moderationState, isModerator } = useModeration();
  const refereeView = isModerator && moderationState.refereeView;
  const { zoomToExtent } = useBoardPosition();
  const setSelectedItems = useSetSelectedItems();
  const [filter, setFilter] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [isSearchPending, startSearchTransition] = React.useTransition();
  const [scrollTop, setScrollTop] = React.useState(0);
  const inputRef = React.useRef(null);
  const resultsRef = React.useRef(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const matchingItems = React.useMemo(
    () =>
      items.filter(
        (item) =>
          canSeeItem({
            item,
            userId: currentUser?.uid,
            board: boardConfig,
            refereeView,
          }) && search(searchFilter, getItemDisplayName(item, itemTemplates, t))
      ),
    [searchFilter, items, t, currentUser?.uid, boardConfig, refereeView]
  );

  React.useEffect(() => {
    setScrollTop(0);
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [searchFilter]);

  const handleSearchChange = React.useCallback(
    (event) => {
      const nextFilter = event.target.value;
      setFilter(nextFilter);
      startSearchTransition(() => setSearchFilter(nextFilter));
    },
    [startSearchTransition]
  );

  const visibleItems = React.useMemo(() => {
    const first = Math.max(
      0,
      Math.floor(scrollTop / RESULTS_ROW_HEIGHT) - RESULTS_OVERSCAN
    );
    const last = Math.min(
      matchingItems.length,
      first + VISIBLE_RESULTS + RESULTS_OVERSCAN * 2
    );
    return matchingItems.slice(first, last).map((item, index) => ({
      item,
      index: first + index,
    }));
  }, [matchingItems, scrollTop]);

  const centerOnItem = React.useCallback(
    (item) => {
      setSelectedItems([item.id]);
      const element = Array.from(document.querySelectorAll("[data-id]")).find(
        (candidate) => candidate.dataset.id === item.id
      );
      if (!element) return;

      zoomToExtent({
        x: item.x + element.offsetWidth / 2,
        y: item.y + element.offsetHeight / 2,
        radius: Math.max(element.offsetWidth, element.offsetHeight) / 2,
      });
    },
    [setSelectedItems, zoomToExtent]
  );

  const handleResultKeyDown = React.useCallback(
    (event, item) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        centerOnItem(item);
      }
    },
    [centerOnItem]
  );

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      onPointerDown={(event) => event.stopPropagation()}
      title={t("Find items")}
      className="side-panel--item-finder"
    >
      <input
        ref={inputRef}
        type="search"
        value={filter}
        onChange={handleSearchChange}
        placeholder={t("Find items")}
        aria-label={t("Find items")}
      />
      {matchingItems.length ? (
        <Results
          ref={resultsRef}
          role="list"
          aria-busy={isSearchPending}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <ResultsContent
            style={{ height: matchingItems.length * RESULTS_ROW_HEIGHT }}
          >
            {visibleItems.map(({ item, index }) => (
              <Result
                key={item.id}
                role="listitem"
                aria-setsize={matchingItems.length}
                aria-posinset={index + 1}
                style={{ top: index * RESULTS_ROW_HEIGHT }}
              >
                <ItemResult
                  item={item}
                  onSelect={centerOnItem}
                  onKeyDown={handleResultKeyDown}
                  t={t}
                />
              </Result>
            ))}
          </ResultsContent>
        </Results>
      ) : (
        <p>{t("No matching items")}</p>
      )}
    </SidePanel>
  );
};

export default React.memo(ItemFinder);
