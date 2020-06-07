import React from 'react';
import './App.css';

import { Provider } from '@scripters/use-socket.io';
import BoardView from './views/BoardView';
import { C2CProvider } from './hooks/useC2C';

import { RecoilRoot } from 'recoil';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || 'http://192.168.0.14:4000';
const SOCKET_OPTIONS = {
  forceNew: true,
};

const room = 'test';

function App() {
  return (
    <RecoilRoot>
      <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
        <C2CProvider room={room}>
          <div className='App'>
            <BoardView room={room} />
          </div>
        </C2CProvider>
      </Provider>
    </RecoilRoot>
  );
}

export default App;
