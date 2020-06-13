import React from 'react';

import Users from '../components/Users';
import GameLoader from '../components/GameLoader';
import ZoomPanRotate from '../components/PanZoomRotate';
import Board from '../components/Board';
import { ItemListAtom } from '../components/Items';
import useUser from '../hooks/useUser';
import useUsers from '../hooks/useUsers';
import { useRecoilState } from 'recoil';
import SelectedItems from '../components/SelectedItems';

export const BoardView = () => {
  const users = useUsers();
  const [user, setUser] = useUser();
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const [boardConfig, setBoardConfig] = React.useState({});

  return (
    <div className='board'>
      <ZoomPanRotate>
        <Board user={user} users={users} config={boardConfig} />
      </ZoomPanRotate>

      <Users user={user} setUser={setUser} users={users} userId={user.id} />

      <SelectedItems />
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
