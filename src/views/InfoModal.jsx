import React from "react";
import { useTranslation, Trans } from "react-i18next";

import { useRecoilValue } from "recoil";

import Modal from "../ui/Modal";
import { getBestTranslationFromConfig } from "../utils/api";

import { BoardConfigAtom } from "../components/Board/";
import styled from "styled-components";

import marked from "marked";

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

const InfoModal = ({ show, setShow }) => {
  const { t, i18n } = useTranslation();

  const boardConfig = useRecoilValue(BoardConfigAtom);

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    [boardConfig, i18n.languages]
  );

  return (
    <Modal title={t("Help & info")} setShow={setShow} show={show}>
      <>
        <header>
          <h3>{t("Game information")}</h3>
        </header>
        <section>
          {translation.description && (
            <div
              dangerouslySetInnerHTML={{
                __html: marked(translation.description),
              }}
            ></div>
          )}
          {!translation.description && <div>{t("No information")}</div>}
        </section>
        <header>
          <h3>{t("Board interactions")}</h3>
        </header>
        <section>
          <Trans i18nKey="helpBoard">
            <ul>
              <li>
                Move the board with middle mouse button click. Alternatively you
                can use left button with alt key.
              </li>
              <li>Zoom with mouse wheel.</li>
              <li>
                Switch to edit mode with top button to be able to edit the game.
              </li>
              <li>You can save and reload game by clicking the burger menu.</li>
            </ul>
          </Trans>{" "}
        </section>
        <header>
          <h3>{t("Item interactions")}</h3>
        </header>
        <section>
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
                <Kbd>o</Kbd> key to reveal front side of selected flipped items
                ONLY ONLY to you.
              </li>
              <li>
                <Kbd>l</Kbd> key to be able to selected previously locked item.
              </li>
            </ul>
          </Trans>
        </section>

        <header>
          <h3>{t("More information")}</h3>
        </header>

        <section>
          <Trans i18nKey="moreInformation">
            <p>
              For more information, visit{" "}
              <a href="https://github.com/jrmi/airboardgame/">
                github repository
              </a>
              .
            </p>
          </Trans>
        </section>
      </>
    </Modal>
  );
};

export default InfoModal;
