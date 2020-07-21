import React from "react";
import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import Modal from "./Modal";

import { BoardConfigAtom } from "./Board/";

import marked from "marked";

const InfoModal = ({ show, setShow }) => {
  const { t } = useTranslation();

  const boardConfig = useRecoilValue(BoardConfigAtom);

  return (
    <Modal
      title={t("Game information")}
      setShow={setShow}
      show={show}
      footer={
        <button
          onClick={() => {
            setShow(false);
          }}
          className="button"
        >
          {t("Close")}
        </button>
      }
    >
      {boardConfig.info && (
        <div
          dangerouslySetInnerHTML={{ __html: marked(boardConfig.info) }}
        ></div>
      )}
      {!boardConfig.info && <div>{t("No information")}</div>}
    </Modal>
  );
};

export default InfoModal;
