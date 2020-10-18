import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

import styled from "styled-components";

import Modal from "../ui/Modal";

const Kbd = styled.kbd`
  background-color: #eee;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
  color: #333;
  display: inline-block;
  font-family: consolas, "Liberation Mono", courier, monospace;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
`;

const HelpModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("Help")}
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
            <Kbd>t</Kbd> key to tap/untap selected items.
          </li>
          <li>
            <Kbd>f</Kbd> key to flip/unflip selected items.
          </li>
          <li>
            <Kbd>o</Kbd> key to reveal front side of selected flipped items ONLY
            to you.
          </li>
          <li>
            <Kbd>l</Kbd> key to be able to selected previously locked item.
          </li>
        </ul>
      </Trans>
    </Modal>
  );
};

export default HelpModal;
