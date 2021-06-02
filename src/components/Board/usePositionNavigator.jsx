import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useSetRecoilState, useRecoilCallback } from "recoil";
import { PanZoomRotateAtom } from "./";

const digitCodes = [...Array(5).keys()].map((id) => `Digit${id}`);

const usePositionNavigator = () => {
  const { t } = useTranslation();
  const setDim = useSetRecoilState(PanZoomRotateAtom);
  const [positions, setPositions] = React.useState({});

  const onKeyUp = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (digitCodes.includes(e.code)) {
        const positionKey = e.code;
        const dim = await snapshot.getPromise(PanZoomRotateAtom);
        if (e.altKey || e.metaKey || e.ctrlKey) {
          setPositions((prev) => ({ ...prev, [positionKey]: { ...dim } }));
          toast.info(t("Position saved!"), {
            autoClose: 800,
            hideProgressBar: true,
          });
        } else {
          if (positions[positionKey]) {
            setDim((prev) => ({ ...prev, ...positions[positionKey] }));
          }
        }
        e.preventDefault();
      }
    },
    [positions, setDim, t]
  );

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyUp]);

  return null;
};

export default usePositionNavigator;
