import React from "react";
import { useTranslation } from "react-i18next";

import LoadLastGameLink from "../components/LoadLastGameLink";
import DownloadGameLink from "../components/DownloadGameLink";

import Modal from "../ui/Modal";

const LoadSaveGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("Game save")}
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
      <h3>{t("Save")}</h3>
      <LoadLastGameLink />
      <button
        className="button"
        onClick={() => {
          setShow(false);
        }}
      >
        {t("Load game")}
      </button>

      <DownloadGameLink />
    </Modal>
  );
};

export default LoadSaveGameModal;
