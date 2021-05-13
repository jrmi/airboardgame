import React from "react";
import { useTranslation } from "react-i18next";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

export const DownloadLink = ({ getData = () => {} }) => {
  const { t } = useTranslation();

  const [downloadURI, setDownloadURI] = React.useState("");
  const [date, setDate] = React.useState(Date.now());
  const [genOnce, setGenOnce] = React.useState(false);

  const updateSaveLink = React.useCallback(async () => {
    const data = await getData();
    if (data.items.length) {
      setDownloadURI(generateDownloadURI(data));
      setDate(Date.now());
      setGenOnce(true);
    }
  }, [getData]);

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

export default DownloadLink;
