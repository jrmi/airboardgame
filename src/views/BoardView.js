import React from "react";
import styled from "styled-components";

import BoardMenu from "../components/BoardMenu";
import GameController from "../components/GameController";
import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { Board } from "../components/Board";
import SelectedItemsPane from "../components/SelectedItemsPane";
import { useUsers, SubscribeUserEvents, UserList } from "../components/users";
import LoadGameModal from "../components/LoadGameModal";
import HelpModal from "../components/HelpModal";
import { useC2C } from "../hooks/useC2C";
import { useTranslation } from "react-i18next";

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #202b38;
`;

const EditButton = styled.button`
  position: absolute;
  top: 0.5em;
  left: 5em;
  z-index: 10;
`;

const HelpButton = styled.button`
  position: absolute;
  top: 0.5em;
  left: 15em;
  z-index: 10;
`;

export const BoardView = () => {
  const { t } = useTranslation();
  const { currentUser, users } = useUsers();
  const [, , isMaster] = useC2C();
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [edit, setEdit] = React.useState(false);

  const toggleEdit = () => {
    setEdit((prev) => !prev);
  };

  const showHelp = () => {
    setShowHelpModal(true);
  };

  return (
    <BoardContainer>
      <BoardMenu setShowLoadGameModal={setShowLoadGameModal} />
      {isMaster && (
        <EditButton onClick={toggleEdit}>
          {!edit ? t("Edit mode") : t("Play")}
        </EditButton>
      )}
      <HelpButton onClick={showHelp}>{t("Help")}</HelpButton>
      <SubscribeUserEvents />
      <SubscribeGameEvents />
      <UserList />
      <Board user={currentUser} users={users} />
      <SelectedItemsPane edit={edit} />
      {edit && <GameController />}
      <LoadGameModal
        showModal={showLoadGameModal}
        setShowModal={setShowLoadGameModal}
      />
      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
    </BoardContainer>
  );
};

export default BoardView;
