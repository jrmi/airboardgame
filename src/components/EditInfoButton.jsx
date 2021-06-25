import React from "react";
import { useTranslation } from "react-i18next";

import BoardConfig from "./BoardConfig";

import Touch from "./ui/Touch";
import Modal from "./ui/Modal";

const EditInfoButton = () => {
  const { t } = useTranslation();

  const [show, setShow] = React.useState(false);

  return (
    <>
      <Touch
        onClick={() => setShow((prev) => !prev)}
        alt={t("Edit game info")}
        title={t("Edit game info")}
        label={t("Edit game info")}
        icon={"new-message"}
      />
      <Modal
        title={t("Edit game information")}
        setShow={setShow}
        show={show}
        position="left"
      >
        <section>
          <BoardConfig />
        </section>
      </Modal>
    </>
  );
};

export default EditInfoButton;
