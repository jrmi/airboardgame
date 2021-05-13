import React from "react";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import { nanoid } from "nanoid";

import "react-toastify/dist/ReactToastify.css";
import "./react-confirm-alert.css";

import Home from "./views/Home";
import GameView from "./views/GameView";
import SessionView from "./views/SessionView";
import AuthView from "./views/AuthView";

const MainRoute = () => {
  return (
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
  );
};

export default MainRoute;
