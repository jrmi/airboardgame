import React from "react";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import LoadGame from "./LoadGame";

export const LoadGameModal = ({ setShowModal, showModal }) => {
  const { t } = useTranslation();
  const [c2c] = useC2C();

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
      setShowModal(false);
    },
    [c2c, setShowModal]
  );

  if (!showModal) {
    return null;
  }

  return (
    <div className="modal">
      <input id="modal_1" type="checkbox" checked={showModal} />
      <div
        className="overlay"
        onClick={() => {
          setShowModal(false);
        }}
      ></div>
      <article>
        <header>
          <h3>Load Game</h3>
          <button
            onClick={() => {
              setShowModal(false);
            }}
            className="close"
          >
            &times;
          </button>
        </header>
        <section className="content">
          <LoadGame onLoad={loadGame} />
        </section>
        <footer>
          <button
            onClick={() => {
              setShowModal(false);
            }}
            className="button dangerous"
          >
            {t("Cancel")}
          </button>
        </footer>
      </article>
    </div>
  );
};

export default LoadGameModal;
