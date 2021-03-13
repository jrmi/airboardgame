import React from "react";
import { useTranslation } from "react-i18next";

import DownloadGameLink from "../components/DownloadGameLink";

import Modal from "../ui/Modal";

const ExportModal = ({ show, setShow }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t("Save game")} setShow={setShow} show={show}>
      <>
        <header>
          <h3>{t("Want to continue later?")}</h3>
        </header>
        <section>
          <p>
            {t(
              "You can save the current session on your computer to load it later!"
            )}
          </p>
          <DownloadGameLink />
        </section>
      </>
    </Modal>
  );
};

export default ExportModal;
