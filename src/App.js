import React, { Suspense } from "react";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import { Provider } from "@scripters/use-socket.io";
import { RecoilRoot } from "recoil";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";

import { C2CProvider } from "./hooks/useC2C";
import BoardView from "./views/BoardView";
import GamesView from "./views/GamesView";
import GameSessionView from "./views/GameSessionView";
import GameView from "./views/GameSessionView";

import Waiter from "./ui/Waiter";

import { SOCKET_URL, SOCKET_PATH } from "./utils/settings";

const SOCKET_OPTIONS = {
  forceNew: true,
  path: SOCKET_PATH,
  transports: ["websocket"],
};

/**
 * Micro component to give room url parameters to C2CProvider
 */
export const ConnectedBoardView = () => {
  const { room } = useParams();

  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <BoardView />
      </C2CProvider>
    </Provider>
  );
};

/**
 * Micro component to give room url parameters to C2CProvider
 */
export const ConnectedGameSessionView = () => {
  const { room, gameId } = useParams();

  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <GameSessionView gameId={gameId} room={room}>
          <BoardView />
        </GameSessionView>
      </C2CProvider>
    </Provider>
  );
};

/**
 * Micro component to give room url parameters to C2CProvider
 */
export const ConnectedGameView = () => {
  const { gameId } = useParams();

  const room = nanoid();

  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <GameSessionView gameId={gameId} room={room}>
          <BoardView editMode={true} />
        </GameSessionView>
      </C2CProvider>
    </Provider>
  );
};

function App() {
  return (
    <Suspense fallback={<Waiter message={"Loading…"} />}>
      <RecoilRoot>
        <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
          <Router>
            <Switch>
              <Route path="/game/:gameId/session/:room/">
                <ConnectedGameSessionView />
              </Route>
              <Redirect
                path="/game/:gameId/session/"
                to={`/game/:gameId/session/${nanoid()}`}
              />
              <Route path="/game/:gameId/">
                <ConnectedGameView />
              </Route>
              <Route exact path="/games">
                <GamesView />
              </Route>
              <Redirect from="/" to="/games/" />
            </Switch>
          </Router>
        </Provider>
      </RecoilRoot>
    </Suspense>
  );
}

export default App;
