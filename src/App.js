import React, { Suspense } from "react";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import { RecoilRoot } from "recoil";
import { nanoid } from "nanoid";

import GamesView from "./views/GamesView";
import GameView from "./views/GameView";
import LoginView from "./views/LoginView";
import AuthView from "./views/AuthView";

import Waiter from "./ui/Waiter";

function App() {
  return (
    <Suspense fallback={<Waiter message={"Loading…"} />}>
      <RecoilRoot>
        <Router>
          <Switch>
            <Route path="/game/:gameId/session/:room/">
              <GameView />
            </Route>
            <Redirect
              path="/game/:gameId/session/"
              to={`/game/:gameId/session/${nanoid()}`}
            />
            <Redirect path="/game/" to={`/game/${nanoid()}/new`} />
            {/*<Route exact path="/game/">
              <GameSessionView create editMode />
  </Route>*/}
            <Route path="/game/:gameId/new">
              <GameView create editMode />
            </Route>
            <Route path="/game/:gameId/">
              <GameView editMode />
            </Route>
            <Route exact path="/games">
              <GamesView />
            </Route>
            <Route exact path="/login">
              <LoginView />
            </Route>
            <Route exact path="/login/:userHash/:token">
              <AuthView />
            </Route>
            <Redirect from="/" to="/games/" />
          </Switch>
        </Router>
      </RecoilRoot>
    </Suspense>
  );
}

export default App;
