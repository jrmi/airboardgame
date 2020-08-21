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

import Waiter from "./components/Waiter";

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
    <C2CProvider room={room}>
      <BoardView />
    </C2CProvider>
  );
};

function App() {
  return (
    <Suspense fallback={<Waiter message={"Loading…"} />}>
      <RecoilRoot>
        <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
          <Router>
            <Switch>
              <Route path="/room/:room/">
                <ConnectedBoardView />
              </Route>
              <Redirect path="/room/" to={`/room/${nanoid()}`} />
              {/*<Route exact path='/home'>
                  <HomePage />
              </Route>*/}
              <Redirect from="/" to="/room/" />
            </Switch>
          </Router>
        </Provider>
      </RecoilRoot>
    </Suspense>
  );
}

export default App;
