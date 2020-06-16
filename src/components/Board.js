import React from 'react';
import Items from './Items';
import Selector from '../components/Selector';
import ActionPane from './ActionPane';
import CursorPane from './CursorPane';

export const Board = ({ user, users, config }) => {
  if (!config.size) {
    return (
      <p
        style={{
          position: 'fixed',
          top: '40vh',
          width: '100vw',
          textAlign: 'center',
        }}
      >
        Please select a game…
      </p>
    );
  }

  return (
    <Selector>
      <ActionPane>
        <CursorPane user={user} users={users}>
          <div
            className='content'
            style={{
              background:
                'repeating-linear-gradient(45deg, #606dbc60, #606dbc60 10px, #46529860 10px, #46529860 20px)',
              width: `${config.size}px`,
              height: `${config.size}px`,
            }}
          >
            <Items />
          </div>
        </CursorPane>
      </ActionPane>
    </Selector>
  );
};

export default Board;
