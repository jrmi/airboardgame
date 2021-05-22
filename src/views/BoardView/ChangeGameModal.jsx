import React from "react";
import { useTranslation } from "react-i18next";

import Modal from "../../ui/Modal";
import { useQuery } from "react-query";
import { getGames } from "../../utils/api";
import useSession from "../../hooks/useSession";

const GameItem = ({ defaultName, id, onLoad, ...rest }) => {
  const { changeGame } = useSession();
  const onClick = () => {
    changeGame(id);
    onLoad();
  };
  return <button onClick={onClick}>{defaultName}</button>;
};

const ChangeGameModalContent = ({ onLoad }) => {
  const { t } = useTranslation();
  const { isLoading, data: gameList } = useQuery("games", async () =>
    (await getGames())
      .filter((game) => game.published)
      .sort((a, b) => {
        const [nameA, nameB] = [
          a.board.defaultName || a.board.name,
          b.board.defaultName || b.board.name,
        ];
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })
  );
  return (
    <>
      <header>
        <h3>{t("Game list")}</h3>
      </header>
      <section>
        <ul>
          {!isLoading &&
            gameList.map((game) => (
              <li key={game.id}>
                <GameItem {...game} onLoad={onLoad} />
              </li>
            ))}
        </ul>
      </section>
    </>
  );
};

const ChangeGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const closeModal = React.useCallback(() => setShow(false), [setShow]);
  return (
    <Modal
      title={t("Change game")}
      setShow={setShow}
      show={show}
      position="left"
    >
      <ChangeGameModalContent onLoad={closeModal} />
    </Modal>
  );
};

export default ChangeGameModal;
