import React from "react";
import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import Modal from "../ui/Modal";
import { getBestTranslationFromConfig } from "../utils/api";

import { BoardConfigAtom } from "../components/Board/";

import marked from "marked";

const InfoModal = ({ show, setShow }) => {
  const { t, i18n } = useTranslation();

  const boardConfig = useRecoilValue(BoardConfigAtom);

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    [boardConfig, i18n.languages]
  );

  return (
    <Modal
      title={t("Game information")}
      setShow={setShow}
      show={show}
      footer={
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            onClick={() => {
              setShow(false);
            }}
            className="button"
          >
            {t("Close")}
          </button>
        </div>
      }
    >
      {translation.description && (
        <div
          dangerouslySetInnerHTML={{ __html: marked(translation.description) }}
        ></div>
      )}
      {!translation.description && <div>{t("No information")}</div>}
    </Modal>
  );
};

export default InfoModal;
