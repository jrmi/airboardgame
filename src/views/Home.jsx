import React from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
//import CookieConsent from "react-cookie-consent";

import useLocalStorage from "../hooks/useLocalStorage";

import HomeNav from "./HomeNav";
import AboutModal from "./AboutModal";
import GameListView from "./GameListView";
import GameStudio from "./GameStudio";

const StyledHome = styled.div`
  min-height: 100vh;
  flex-direction: column;
  & > footer {
    width: 100%;
    grid-column: 1 / 4;
    padding: 0.5em 0;
    text-align: center;
    background-color: #00000099;
  }
`;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Home = () => {
  const { t } = useTranslation();

  const [isBeta, setIsBeta] = useLocalStorage("isBeta", false);

  if (isBeta) {
    console.log("Beta activated");
  }

  /*const [cookieConsent, setCookieConsent] = useLocalStorage(
    "cookieConsent",
    false
  );*/
  const cookieConsent = true;
  const [showAboutModal, setShowAboutModal] = React.useState(false);

  let query = useQuery();

  const forceBeta = query.get("beta") === "true";

  React.useEffect(() => {
    if (forceBeta) {
      setIsBeta(true);
    }
  }, [forceBeta, setIsBeta]);

  return (
    <>
      <StyledHome>
        <HomeNav cookieConsent={cookieConsent} />
        <Switch>
          <Route exact path="/games">
            <GameListView />
          </Route>
          <Route path="/studio">
            <GameStudio />
          </Route>
        </Switch>
        <footer>
          <button
            className="button clear"
            onClick={() => setShowAboutModal(true)}
          >
            {t("About")}
          </button>
        </footer>
      </StyledHome>
      <AboutModal show={showAboutModal} setShow={setShowAboutModal} />
      {/*<CookieConsent
        location="bottom"
        buttonText={t("Got it!")}
        enableDeclineButton
        declineButtonText={t("Refuse")}
        cookieName="cookieConsent"
        onAccept={() => setCookieConsent(true)}
        containerClasses="cookie"
        expires={150}
        buttonStyle={{
          color: "var(--font-color)",
          backgroundColor: "var(--color-secondary)",
        }}
        style={{
          backgroundColor: "#000000CE",
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        }}
      >
        {t("This site use a cookie only to know if your are authenticated.")}
      </CookieConsent>*/}
    </>
  );
};

export default Home;
