import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Form } from "react-final-form";

import { FiSettings } from "react-icons/fi";

import SidePanel from "../../ui/SidePanel";
import AutoSave from "../../ui/formUtils/AutoSave";

import { useBoardConfig } from "react-sync-board";
import NavButton from "../../ui/NavButton";
import InteractionSettingsForm from "./InteractionSettingsForm";

const BoardConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  & .trash {
    float: right;
  }
`;

const BoardConfigPanel = ({
  BoardFormComponent,
  interaction,
  setInteraction,
  show,
  setShow,
  title,
}) => {
  const { t } = useTranslation();
  const [, setBoardConfig] = useBoardConfig();

  const onSubmitHandler = React.useCallback(
    (data) => {
      setBoardConfig((prev) => ({
        ...prev,
        ...data,
        grid: { ...prev.grid, ...data.grid },
      }));
    },
    [setBoardConfig]
  );

  return (
    <SidePanel
      title={t(title || "Edit game information")}
      onClose={() => setShow(false)}
      show={show}
      position="left"
    >
      <Form
        onSubmit={onSubmitHandler}
        render={() => (
          <BoardConfigForm>
            <AutoSave save={onSubmitHandler} />
            {BoardFormComponent && <BoardFormComponent />}
            {interaction && setInteraction && (
              <InteractionSettingsForm
                interaction={interaction}
                setInteraction={setInteraction}
              />
            )}
          </BoardConfigForm>
        )}
      />
    </SidePanel>
  );
};

const EditInfoButton = ({
  BoardFormComponent,
  interaction,
  setInteraction,
  title,
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
          alt={t(title || "Edit game info")}
          title={t(title || "Edit game info")}
          Icon={FiSettings}
        />
      )}
      <BoardConfigPanel
        BoardFormComponent={BoardFormComponent}
        interaction={interaction}
        setInteraction={setInteraction}
        show={show}
        setShow={setShow}
        title={title}
      />
    </>
  );
};

export default EditInfoButton;
