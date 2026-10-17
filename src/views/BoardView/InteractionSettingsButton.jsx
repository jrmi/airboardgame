import React from "react";
import { useTranslation } from "react-i18next";
import { FiMousePointer } from "react-icons/fi";

import Modal from "../../ui/Modal";
import NavButton from "../../ui/NavButton";
import InteractionSettingsForm from "./InteractionSettingsForm";

const InteractionSettingsButton = ({
  interaction,
  setInteraction,
  renderTrigger,
}) => {
  const { t } = useTranslation();
  const [show, setShow] = React.useState(false);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setShow((prev) => !prev))
      ) : (
        <NavButton
          onClick={() => setShow((prev) => !prev)}
          alt={t("Player interaction")}
          title={t("Player interaction")}
          Icon={FiMousePointer}
        />
      )}
      <Modal title={t("Player interaction")} show={show} setShow={setShow}>
        <InteractionSettingsForm
          interaction={interaction}
          setInteraction={setInteraction}
        />
      </Modal>
    </>
  );
};

export default InteractionSettingsButton;
