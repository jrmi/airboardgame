import useAsyncEffect from "use-async-effect";
import { useBoardPosition } from "react-sync-board";

import useSession from "../hooks/useSession";

import useLocalStorage from "../hooks/useLocalStorage";
import { useIntervalEffect } from "@react-hookz/web/esm/useIntervalEffect";

// 150 days max for session dim
const MAX_SESSION_DIM_RETENTION = 1000 * 60 * 60 * 24 * 150;

export const SessionRestoreDim = () => {
  const { sessionLoaded, sessionId, getSession } = useSession();

  const [sessionDimensions, setSessionDimensions] = useLocalStorage(
    "sessionDimensions",
    {}
  );
  const { getDim, setDim, zoomToExtent } = useBoardPosition();

  /**
   * Load the previous dimension for this session if exists
   */
  useAsyncEffect(
    async (isMounted) => {
      if (sessionLoaded) {
        if (sessionDimensions[sessionId]) {
          const { translateX, translateY, scale } = sessionDimensions[
            sessionId
          ];
          const dim = {
            translateX: translateX || -1500,
            translateY: translateY || -1500,
            scale: scale || 1,
          };
          setTimeout(() => {
            if (isMounted) {
              setDim(() => dim);
            }
          }, 500);
        } else {
          const session = await getSession();
          if (!isMounted) return;

          if (session.board.initialBoardPosition) {
            setTimeout(() => {
              zoomToExtent(session.board.initialBoardPosition);
            }, 500);
          }
        }

        const now = Date.now();

        const newDim = Object.fromEntries(
          Object.entries(sessionDimensions).filter(([, { timestamp }]) => {
            return timestamp && now - timestamp < MAX_SESSION_DIM_RETENTION;
          })
        );
        setSessionDimensions(newDim);
      }
      // We want to set dimension only when session is loaded
    },
    [sessionLoaded]
  );

  /**
   * Save board dimension in localstorage every 2 seconds for next visit
   */
  useIntervalEffect(async () => {
    const currentDim = getDim();
    setSessionDimensions((prev) => ({
      ...prev,
      [sessionId]: { ...currentDim, timestamp: Date.now() },
    }));
  }, 2000);

  return null;
};

export default SessionRestoreDim;
