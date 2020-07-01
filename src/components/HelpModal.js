import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

import Modal from "./Modal";

const HelpModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("Help")}
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
      <h3>{t("Board interactions")}</h3>
      <Trans i18nKey="helpBoard">
        <ul>
          <li>
            Move the board with middle mouse button click. Alternatively you can
            use left button with alt key.
          </li>
          <li>Zoom with mouse wheel.</li>
          <li>
            Switch to edit mode with top button to be able to edit the game.
          </li>
          <li>You can save and reload game by clicking the burger menu.</li>
        </ul>
      </Trans>
      <h3>{t("Item interactions")}</h3>
      <Trans i18nKey="helpItem">
        <ul>
          <li>Double click on any item that can be flipped to flip it.</li>
          <li>
            <strong>t</strong> key to tap/untap selected items.
          </li>
          <li>
            <strong>f</strong> key to flip/unflip selected items.
          </li>
          <li>
            <strong>o</strong> key to reveal front side of selected flipped
            items ONLY to you.
          </li>
          <li>
            <strong>l</strong> key to be able to selected previously locked
            item.
          </li>
        </ul>
      </Trans>
    </Modal>
  );
};

export default HelpModal;
