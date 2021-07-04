import React from "react";

import { Route, Switch, Redirect } from "react-router-dom";

import { nanoid } from "nanoid";

import "react-toastify/dist/ReactToastify.css";
import "./react-confirm-alert.css";

import Home from "./views/Home";
// import GameView from "./views/GameView";
// import RoomWrapperView from "./views/RoomWrapperView";
import AuthView from "./views/AuthView";
// import RoomView from "./views/RoomView";

import { Provider as SocketIOProvider } from "@scripters/use-socket.io";

import { SOCKET_URL, SOCKET_OPTIONS } from "./utils/settings";

const WithSocketIO = ({ children }) => (
  <SocketIOProvider url={SOCKET_URL} options={SOCKET_OPTIONS}>
    {children}
  </SocketIOProvider>
);

const MainRoute = () => {
  return (
    <Switch>
      {/* for compat with old url scheme */}
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
      {/* for compat with old url scheme */}
      <Route path="/game/:gameId/session/:sessionId/">
        {({
          match: {
            params: { gameId, sessionId },
          },
        }) => {
          return <Redirect to={`/session/${sessionId}/?fromGame=${gameId}`} />;
        }}
      </Route>
      {/* Start a new session from this game */}
      <Route path="/playgame/:gameId" exact>
        {({
          match: {
            params: { gameId },
          },
        }) => {
          // Redirect to new session id
          return (
            <Redirect
              to={{
                pathname: `/session/${nanoid()}/`,
                search: `?fromGame=${gameId}`,
              }}
            />
          );
        }}
      </Route>
      {/*<Route path="/session/:sessionId">
        {({
          location: { search },
          match: {
            params: { sessionId },
          },
        }) => {
          const params = new URLSearchParams(search);
          const fromGame = params.get("fromGame");

          // Redirect to new session id
          return (
            <WithSocketIO>
              <RoomWrapperView sessionId={sessionId} fromGame={fromGame} />
            </WithSocketIO>
          );
        }}
      </Route>*/}
      {/* Game edition/}
      <Route path="/game/:gameId?">
        <WithSocketIO>
          <GameView />
        </WithSocketIO>
      </Route>
      {/* Room routes}
      <Route path="/room/:roomId">
        {({
          match: {
            params: { roomId },
          },
        }) => (
          <WithSocketIO>
            <RoomView roomId={roomId} />
          </WithSocketIO>
        )}
      </Route>
      {/* Auth rout */}
      <Route exact path="/login/:userHash/:token">
        <AuthView />
      </Route>
      {/* Default route */}
      <Redirect from="/" to="/games/" exact />
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
};

export default MainRoute;
