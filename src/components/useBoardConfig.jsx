import React from "react";
import { useC2C } from "../hooks/useC2C";
import { useRecoilState } from "recoil";

import debounce from "lodash.debounce";

import { BoardConfigAtom } from "./Board/game/atoms";

export const useBoardConfig = () => {
  const { c2c } = useC2C();
  const [boardConfig, setBoardConfig] = useRecoilState(BoardConfigAtom);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPublishUpdate = React.useCallback(
    debounce((newConfig) => {
      c2c.publish("updateBoardConfig", newConfig);
    }, 1000),
    [c2c]
  );

  const setSyncBoardConfig = React.useCallback(
    (callbackOrConfig, sync = true) => {
      let callback = callbackOrConfig;
      if (typeof callbackOrConfig === "object") {
        callback = () => callbackOrConfig;
      }
      setBoardConfig((prev) => {
        const newConfig = callback(prev);
        if (sync) {
          debouncedPublishUpdate(newConfig);
        }
        return newConfig;
      });
    },
    [setBoardConfig, debouncedPublishUpdate]
  );

  return [boardConfig, setSyncBoardConfig];
};

export default useBoardConfig;
