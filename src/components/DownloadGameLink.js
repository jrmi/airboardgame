import React from "react";
import { useRecoilCallback } from "recoil";
import { useTranslation } from "react-i18next";

import useGameStorage from "./Board/game/useGameStorage";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

export const DownloadGameLink = () => {
  const { t } = useTranslation();

  const [downloadURI, setDownloadURI] = React.useState({});
  const [date, setDate] = React.useState(Date.now());

  const [, setGameLocalSave] = useGameStorage();

  const updateSaveLink = useRecoilCallback(
    ({ snapshot }) => async () => {
      const availableItemList = await snapshot.getPromise(
        AvailableItemListAtom
      );
      const boardConfig = await snapshot.getPromise(BoardConfigAtom);
      const itemList = await snapshot.getPromise(AllItemsSelector);
      const game = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
      };
      if (game.items.length) {
        setDownloadURI(generateDownloadURI(game));
        setDate(Date.now());
        setGameLocalSave(game);
      }
    },
    [setGameLocalSave]
  );

  React.useEffect(() => {
    let mounted = true;

    const cancel = setInterval(() => {
      if (!mounted) return;
      updateSaveLink();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(cancel);
    };
  }, [updateSaveLink]);

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
