import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

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
import "./react-confirm-alert.css";

import Home from "./views/Home";
import GameView from "./views/GameView";
import SessionView from "./views/SessionView";
import AuthView from "./views/AuthView";

import Waiter from "./ui/Waiter";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Suspense fallback={<Waiter message={"Loading…"} />}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Switch>
              <Route path="/game/:gameId/session/" exact>
                {({
                  match: {
                    params: { gameId },
                  },
                }) => {
                  // Redirect to new session id
                  return (
                    <Redirect to={`/game/${gameId}/session/${nanoid()}`} />
                  );
                }}
              </Route>
              <Route path="/game/:gameId/session/:room/">
                <SessionView />
              </Route>
              <Route path="/game/:gameId?">
                <GameView />
              </Route>
              <Route exact path="/login/:userHash/:token">
                <AuthView />
              </Route>
              <Redirect from="/" to="/games/" exact />
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </QueryClientProvider>
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
