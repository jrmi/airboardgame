import React from "react";
import { BoardGridOverlay } from "react-sync-board";
import useGlobalConf from "../hooks/useGlobalConf";

const GridOverlay = () => {
  const { editItem } = useGlobalConf();
  return <BoardGridOverlay preview={Boolean(editItem)} />;
};

export default GridOverlay;
