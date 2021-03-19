import React from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CookieNotice, { useCookieConsent } from "./CookieNotice";

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
  const cookieConsent = useCookieConsent();

  const [isBeta, setIsBeta] = useLocalStorage("isBeta", false);

  if (isBeta) {
    console.log("Beta activated");
  }

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

      <CookieNotice />
    </>
  );
};

export default Home;
