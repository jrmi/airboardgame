import React, { Suspense } from "react";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import { RecoilRoot } from "recoil";
import { nanoid } from "nanoid";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "rc-slider/assets/index.css";

import GameListView from "./views/GameListView";
import GameView from "./views/GameView";
import AuthView from "./views/AuthView";

import Waiter from "./ui/Waiter";

const App = () => {
  return (
    <Suspense fallback={<Waiter message={"Loading…"} />}>
      <RecoilRoot>
        <Router>
          <Switch>
            <Route path="/game/:gameId/session/" exact>
              {({
                match: {
                  params: { gameId },
                },
              }) => {
                // Redirect to new session id
                return <Redirect to={`/game/${gameId}/session/${nanoid()}`} />;
              }}
            </Route>
            <Route path="/game/:gameId/session/:room/">
              <GameView />
            </Route>
            <Route path="/game/:gameId?">
              <GameView edit />
            </Route>
            <Route exact path="/games/">
              <GameListView />
            </Route>
            <Route exact path="/login/:userHash/:token">
              <AuthView />
            </Route>
            <Redirect from="/" to="/games/" />
          </Switch>
        </Router>
      </RecoilRoot>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Suspense>
  );
};

export default App;
