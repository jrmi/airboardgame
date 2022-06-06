import useAsyncEffect from "use-async-effect";
import { useBoardPosition } from "react-sync-board";

import useSession from "../hooks/useSession";

import useLocalStorage from "../hooks/useLocalStorage";

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
          const dim = {
            ...sessionDimensions[sessionId],
            timestamp: undefined,
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [sessionLoaded]
  );

  /**
   * Save board dimension in localstorage every 2 seconds for next visit
   */
  useAsyncEffect((isMounted) => {
    const interval = setInterval(async () => {
      const currentDim = await getDim();
      if (isMounted) {
        setSessionDimensions((prev) => ({
          ...prev,
          [sessionId]: { ...currentDim, timestamp: Date.now() },
        }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default SessionRestoreDim;
