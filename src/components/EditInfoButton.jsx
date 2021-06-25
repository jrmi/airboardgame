import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Form } from "react-final-form";

import Touch from "./ui/Touch";
import Modal from "./ui/Modal";
import AutoSave from "./ui/formUtils/AutoSave";

import useBoardConfig from "./useBoardConfig";

const BoardConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  & .trash {
    float: right;
  }
`;

const BoardConfig = ({ BoardFormComponent }) => {
  const [, setBoardConfig] = useBoardConfig();

  const onSubmitHandler = React.useCallback(
    (data) => {
      setBoardConfig((prev) => ({
        ...prev,
        ...data,
      }));
    },
    [setBoardConfig]
  );

  return (
    <Form
      onSubmit={onSubmitHandler}
      render={() => (
        <BoardConfigForm>
          <AutoSave save={onSubmitHandler} />
          <BoardFormComponent />
        </BoardConfigForm>
      )}
    />
  );
};

const EditInfoButton = ({ BoardFormComponent }) => {
  const { t } = useTranslation();

  const [show, setShow] = React.useState(false);

  return (
    <>
      <Touch
        onClick={() => setShow((prev) => !prev)}
        alt={t("Edit game info")}
        title={t("Edit game info")}
        label={t("Edit game info")}
        icon={"cog"}
      />
      <Modal
        title={t("Edit game information")}
        setShow={setShow}
        show={show}
        position="left"
      >
        <section>
          <BoardConfig BoardFormComponent={BoardFormComponent} />
        </section>
      </Modal>
    </>
  );
};

export default EditInfoButton;
