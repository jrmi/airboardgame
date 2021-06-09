import React from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { ItemInteractionsAtom } from "../game/atoms";

const useItemInteraction = (interaction) => {
  const setInteractions = useSetRecoilState(ItemInteractionsAtom);

  const register = React.useCallback(
    (callback) => {
      setInteractions((prev) => {
        if (!prev[interaction]) {
          prev[interaction] = [];
        }
        const newInter = [...prev[interaction]];
        newInter.push(callback);
        return {
          ...prev,
          [interaction]: newInter,
        };
      });
      return () => {
        setInteractions((prev) => ({
          ...prev,
          [interaction]: prev[interaction].filter((c) => c !== callback),
        }));
      };
    },
    [interaction, setInteractions]
  );

  const call = useRecoilCallback(({ snapshot }) => async (items) => {
    const itemInteractions = await snapshot.getPromise(ItemInteractionsAtom);
    if (!itemInteractions[interaction]) return;
    itemInteractions[interaction].forEach((callback) => {
      callback(items);
    });
  });

  return { register, call };
};

export default useItemInteraction;
