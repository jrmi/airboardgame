import React, { Suspense, Timeout } from "react";
import "./App.css";

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

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";

const SOCKET_OPTIONS = {
  forceNew: true,
  path: SOCKET_PATH,
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

const Spinner = ({ children }) => {
  return (
    <Timeout ms={5000}>
      {(didTimeout) => (didTimeout ? <span>Loading...</span> : children)}
    </Timeout>
  );
};

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <RecoilRoot>
        <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
          <div className="App">
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
          </div>
        </Provider>
      </RecoilRoot>
    </Suspense>
  );
}

export default App;
