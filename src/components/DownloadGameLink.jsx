import React from "react";
import { useRecoilCallback } from "recoil";
import { useTranslation } from "react-i18next";

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

  const [downloadURI, setDownloadURI] = React.useState("");
  const [date, setDate] = React.useState(Date.now());
  const [genOnce, setGenOnce] = React.useState(false);

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
        setGenOnce(true);
      }
    },
    []
  );

  React.useEffect(() => {
    let mounted = true;

    const cancel = setInterval(() => {
      if (!mounted) return;
      updateSaveLink();
    }, 2000);

    updateSaveLink();

    return () => {
      mounted = false;
      setGenOnce(false);
      clearInterval(cancel);
    };
  }, [updateSaveLink]);

  return (
    <>
      {genOnce && (
        <a
          className="button primary icon"
          href={downloadURI}
          download={`airboardgame_${date}.json`}
        >
          {t("Export")}
          <img
            src={"https://icongr.am/entypo/download.svg?size=20&color=f9fbfa"}
            alt="icon"
          />
        </a>
      )}
      {!genOnce && (
        <button className="button primary" disabled>
          {t("Generating export")}...
        </button>
      )}
    </>
  );
};

export default DownloadGameLink;
