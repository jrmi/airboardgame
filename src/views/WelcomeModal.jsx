import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

import styled from "styled-components";

import { toast } from "react-toastify";

import Modal from "../ui/Modal";

import { useC2C } from "../hooks/useC2C";

const StyledUrl = styled.div`
  background-color: var(--color-midGrey);
  padding: 0.5em;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2em;

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & img {
    margin-left: 1em;
    cursor: pointer;
  }
`;

const WelcomeModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const currentUrl = window.location.href;
  const inputRef = React.useRef();

  const [, , , room] = useC2C();

  const handleCopy = () => {
    inputRef.current.style.display = "block";
    inputRef.current.select();
    document.execCommand("copy");
    inputRef.current.style.display = "none";
    toast.info(t("Url copied to clipboard!"), { autoClose: 1000 });
  };

  const meetUrl = `https://meet.jit.si/airboardgame__${room}`;

  return (
    <Modal
      title={t("Ready to play ?")}
      setShow={setShow}
      show={show}
      footer={
        <button
          onClick={() => {
            setShow(false);
          }}
          className="button"
        >
          {t("I want to play...")}
        </button>
      }
    >
      <header>
        <h3>{t("Share this link with your friends")}</h3>
      </header>
      <section>
        <StyledUrl>
          <span>{currentUrl}</span>
          <img
            className="copy"
            src="https://icongr.am/entypo/copy.svg?size=22&color=888886"
            alt={t("Copy")}
            onClick={handleCopy}
          />
        </StyledUrl>

        <Trans i18nKey="welcomeTip">
          <p>
            Tip: Use an audio conferencing system to talk with other players,
            like <a href={meetUrl}>Jitsi</a> (free & open-source).
          </p>
        </Trans>
      </section>
      <input
        value={currentUrl}
        readOnly
        ref={inputRef}
        style={{ display: "none" }}
      />
    </Modal>
  );
};

export default WelcomeModal;
