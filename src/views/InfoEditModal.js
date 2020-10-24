import React from "react";
import { useTranslation } from "react-i18next";

import Modal from "../ui/Modal";

import BoardConfig from "../components/BoardConfig";

const InfoModal = ({ show, setShow }) => {
  const { t } = useTranslation();

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
            className="button primary"
          >
            {t("Close")}
          </button>
        </div>
      }
    >
      <BoardConfig />
    </Modal>
  );
};

export default InfoModal;
