import React from "react";

import { SHOW_WELCOME } from "../../utils/settings";
import MainView from "../../components/MainView";
import useC2C from "../../components/hooks/useC2C";

import WelcomeModal from "./WelcomeModal";
import NavBar from "./NavBar";
import BoardForm from "./BoardForm";

import {
  uploadResourceImage,
  listResourceImage,
  deleteResourceImage,
} from "../../utils/api";

const mediaHandlers = {
  uploadMedia: uploadResourceImage,
  listMedia: listResourceImage,
  deleteMedia: deleteResourceImage,
};

export const BoardView = (props) => {
  const { isMaster } = useC2C("board");

  const [showWelcomeModal, setShowWelcomeModal] = React.useState(
    SHOW_WELCOME && !props.editMode && isMaster
  );

  return (
    <>
      <NavBar editMode={props.edit} />
      <WelcomeModal show={showWelcomeModal} setShow={setShowWelcomeModal} />
      <MainView
        {...props}
        mediaHandlers={mediaHandlers}
        BoardFormComponent={BoardForm}
      />
    </>
  );
};

export default BoardView;
