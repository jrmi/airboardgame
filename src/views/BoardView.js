import React from 'react';

import Users from '../components/Users';
import GameLoader from '../components/GameLoader';
import ZoomPanRotate from '../components/PanZoomRotate';
import Board from '../components/Board';
import useUser from '../hooks/useUser';
import useUsers from '../hooks/useUsers';

export const BoardView = () => {
  const users = useUsers();
  const [user, setUser] = useUser();
  const [itemList, setItemList] = React.useState([]);
  const [boardConfig, setBoardConfig] = React.useState({});

  return (
    <div className='board'>
      <ZoomPanRotate>
        <Board
          user={user}
          users={users}
          items={itemList}
          config={boardConfig}
        />
      </ZoomPanRotate>

      <Users user={user} setUser={setUser} users={users} userId={user.id} />
      <GameLoader
        itemList={itemList}
        setItemList={setItemList}
        boardConfig={boardConfig}
        setBoardConfig={setBoardConfig}
      />
    </div>
  );
};

export default BoardView;
