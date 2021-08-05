import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { useRecoilValue } from "recoil";
import useAsyncEffect from "use-async-effect";
import styled from "styled-components";

import Modal from "../../components/ui/Modal";
// import { BoardConfigAtom } from "../../components/board";

import { getBestTranslationFromConfig } from "../../utils/api";

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

  const [info, setInfo] = React.useState("");

  // const boardConfig = useRecoilValue(BoardConfigAtom);

  const translation = React.useMemo(
    // () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    () => getBestTranslationFromConfig({}, i18n.languages),
    [i18n.languages]
  );

  useAsyncEffect(
    async (isMounted) => {
      const marked = (await import("marked")).default;
      if (!isMounted()) return;

      const renderer = new marked.Renderer();
      renderer.link = (href, title, text) => {
        return `<a target="_blank" rel="noopener" href="${href}" title="${title}">${text}</a>`;
      };
      setInfo(
        marked(translation.description || "", {
          renderer: renderer,
        })
      );
    },
    [setInfo, translation.description]
  );

  return (
    <Modal title={t("Help & info")} setShow={setShow} show={show}>
      <header>
        <h3>{t("Game information")}</h3>
      </header>
      <section>
        {translation.description && (
          <div
            dangerouslySetInnerHTML={{
              __html: info,
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
            <li>
              Use <Kbd>Ctrl</Kbd> + <Kbd>1</Kbd>-<Kbd>9</Kbd> to save a position
              and <Kbd>1</Kbd>-<Kbd>9</Kbd>
              to restore it.
            </li>
            <li>
              Use <Kbd>space</Kbd> to zoom temporally to the center of screen.
            </li>
          </ul>
        </Trans>
      </section>
      <header>
        <h3>{t("Item interactions")}</h3>
      </header>
      <section>
        <Trans i18nKey="helpItem">
          <ul>
            <li>Double click on any item to execute the main action on it.</li>
            <li>
              Long clic on item to be able to selected previously locked item.
            </li>
            <li>See other shortcuts in action menu.</li>
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
    </Modal>
  );
};

export default InfoModal;
