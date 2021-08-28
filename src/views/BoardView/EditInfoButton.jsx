import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Form } from "react-final-form";

import Touch from "../../ui/Touch";
import SidePanel from "../../ui/SidePanel";
import AutoSave from "../../ui/formUtils/AutoSave";

import { useBoardConfig } from "react-sync-board";

const BoardConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  & .trash {
    float: right;
  }
`;

const BoardConfigPanel = ({ BoardFormComponent, show, setShow }) => {
  const { t } = useTranslation();
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
    <SidePanel
      title={t("Edit game information")}
      onClose={() => setShow(false)}
      show={show}
      position="left"
    >
      <section>
        <Form
          onSubmit={onSubmitHandler}
          render={() => (
            <BoardConfigForm>
              <AutoSave save={onSubmitHandler} />
              <BoardFormComponent />
            </BoardConfigForm>
          )}
        />
      </section>
    </SidePanel>
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
      <BoardConfigPanel
        BoardFormComponent={BoardFormComponent}
        show={show}
        setShow={setShow}
      />
    </>
  );
};

export default EditInfoButton;
