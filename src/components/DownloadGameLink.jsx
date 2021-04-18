import React from "react";
import { useTranslation } from "react-i18next";

import useGame from "../hooks/useGame";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

export const DownloadGameLink = () => {
  const { t } = useTranslation();
  const { getGame } = useGame();

  const [downloadURI, setDownloadURI] = React.useState("");
  const [date, setDate] = React.useState(Date.now());
  const [genOnce, setGenOnce] = React.useState(false);

  const updateSaveLink = React.useCallback(async () => {
    const game = await getGame();
    if (game.items.length) {
      setDownloadURI(generateDownloadURI(game));
      setDate(Date.now());
      setGenOnce(true);
    }
  }, [getGame]);

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
          className="button success icon"
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
        <button className="button" disabled>
          {t("Generating export")}...
        </button>
      )}
    </>
  );
};

export default DownloadGameLink;
