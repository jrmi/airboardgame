import React from "react";
import styled from "styled-components";

import Users from "../components/Users";
import GameController from "../components/GameController";
import Board from "../components/Board";
import { ItemListAtom } from "../components/Items";
import { AvailableItemListAtom } from "../components/AvailableItems";
import useUser from "../hooks/useUser";
import useUsers from "../hooks/useUsers";
import { useRecoilState } from "recoil";
import SelectedItems from "../components/SelectedItems";

const BoardContainer = styled.div`
  display: fixed;
  top: 0;
  left: 0;
  background-color: #282c34;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
`;

export const BoardView = () => {
  const users = useUsers();
  const [user, setUser] = useUser();
  const [availableItemList, setAvailableItemList] = useRecoilState(
    AvailableItemListAtom
  );
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const [boardConfig, setBoardConfig] = React.useState({});

  return (
    <BoardContainer>
      <Board user={user} users={users} config={boardConfig} />
      <Users user={user} setUser={setUser} users={users} userId={user.id} />
      <SelectedItems />
      <GameController
        availableItemList={availableItemList}
        setAvailableItemList={setAvailableItemList}
        itemList={itemList}
        setItemList={setItemList}
        boardConfig={boardConfig}
        setBoardConfig={setBoardConfig}
        //game={{ items: itemList, board: boardConfig }}
        //setGame=
      />
    </BoardContainer>
  );
};

export default BoardView;
