import React from "react";
import { useTranslation } from "react-i18next";

import Modal from "../ui/Modal";

import BoardConfig from "../components/BoardConfig";

const InfoModal = ({ show, setShow }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t("Edit game information")} setShow={setShow} show={show}>
      <section>
        <BoardConfig />
      </section>
    </Modal>
  );
};

export default InfoModal;
