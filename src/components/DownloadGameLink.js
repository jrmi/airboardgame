import React from "react";
import { useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";

import useGameStorage from "./Board/game/useGameStorage";

import { AvailableItemListAtom, BoardConfigAtom } from "./Board/game/atoms";

import throttle from "lodash.throttle";

import { useItems } from "../components/Board/Items";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

export const DownloadGameLink = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const boardConfig = useRecoilValue(BoardConfigAtom);
  const { itemList } = useItems();

  const { t } = useTranslation();

  const [downloadURI, setDownloadURI] = React.useState({});
  const [date, setDate] = React.useState(Date.now());

  const [, setGameLocalSave] = useGameStorage();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSaveLink = React.useCallback(
    throttle(
      (game) => {
        if (game.items.length) {
          setDownloadURI(generateDownloadURI(game));
          setDate(Date.now());
          setGameLocalSave(game);
        }
      },
      5000,
      { trailing: true }
    ),
    []
  );

  React.useEffect(() => {
    updateSaveLink({
      items: itemList,
      board: boardConfig,
      availableItems: availableItemList,
    });
  }, [itemList, boardConfig, availableItemList, updateSaveLink]);

  return (
    <a
      className="bm-item button"
      style={{ display: "block" }}
      href={downloadURI}
      download={`save_${date}.json`}
    >
      {t("Save game")}
    </a>
  );
};

export default DownloadGameLink;
