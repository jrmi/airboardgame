import React from "react";

import { SHOW_WELCOME } from "../../utils/settings";
import MainView from "../../components/MainView";
import useC2C from "../../hooks/useC2C";

import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";

export const BoardView = (props) => {
  const { isMaster } = useC2C("board");

  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !props.editMode && isMaster
  );

  return (
    <>
      <NavBar editMode={props.editMode} />
      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      <MainView {...props} />
    </>
  );
};

export default BoardView;
