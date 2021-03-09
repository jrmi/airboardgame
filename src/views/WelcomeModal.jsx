import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

import styled from "styled-components";

import { toast } from "react-toastify";

import Modal from "../ui/Modal";

import { useC2C } from "../hooks/useC2C";

const WelcomeContent = styled.div`
  & .url {
    background-color: var(--bg-color);
    padding: 0.5em;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    & img {
      margin-left: 1em;
      cursor: pointer;
    }
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
      <WelcomeContent>
        <h3>{t("Invite your friends")}</h3>
        <Trans i18nKey="InviteFriends">
          <p>
            To invite other players to play with you, share the following link
            with your friends.
          </p>
        </Trans>

        <div className="url">
          <span>{currentUrl}</span>
          <img
            className="copy"
            src="https://icongr.am/entypo/copy.svg?size=22&color=888886"
            alt={t("Copy")}
            onClick={handleCopy}
          />
        </div>

        <h3>{t("Talk with your friends")}</h3>
        <Trans i18nKey="useAudioConf">
          <p>
            We recommend you to use any audio conferencing system to talk with
            your friends. For example you can use <a href={meetUrl}>Jitsi</a>.
          </p>
        </Trans>

        <h3>{t("More information")}</h3>
        <Trans i18nKey="moreInformation">
          <p>
            For more information, visit{" "}
            <a href="https://github.com/jrmi/airboardgame/">
              github repository
            </a>
            .
          </p>
        </Trans>
        <input
          value={currentUrl}
          readOnly
          ref={inputRef}
          style={{ display: "none" }}
        />
      </WelcomeContent>
    </Modal>
  );
};

export default WelcomeModal;
