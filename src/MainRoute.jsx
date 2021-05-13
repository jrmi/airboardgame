import React from "react";

import { Route, Switch, Redirect } from "react-router-dom";

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
          return <Redirect to={`/session/${nanoid()}/?fromGame=${gameId}`} />;
        }}
      </Route>
      <Route path="/session/" exact>
        {({ location: { search } }) => {
          const params = new URLSearchParams(search);
          const fromGame = params.get("fromGame");

          // Redirect to new session id
          return <Redirect to={`/session/${nanoid()}/?fromGame=${fromGame}`} />;
        }}
      </Route>
      <Route path="/game/:gameId/session/:sessionId/?fromGame=:fromGame">
        {({
          match: {
            params: { gameId, sessionId },
          },
        }) => {
          return <Redirect to={`/session/${sessionId}/?fromGame=${gameId}`} />;
        }}
      </Route>
      <Route path="/session/:sessionId/">
        {({
          location: { search },
          match: {
            params: { sessionId },
          },
        }) => {
          const params = new URLSearchParams(search);
          const fromGame = params.get("fromGame");

          // Redirect to new session id
          return <SessionView sessionId={sessionId} fromGame={fromGame} />;
        }}
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
