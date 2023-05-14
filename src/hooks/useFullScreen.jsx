import React from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

export const FullScreenContext = React.createContext({});

export const FullScreenProvider = ({ children }) => {
  const handle = useFullScreenHandle();

  const toggleFullScreen = React.useCallback(() => {
    handle.active ? handle.exit() : handle.enter();
  }, [handle]);

  return (
    <FullScreen handle={handle}>
      <FullScreenContext.Provider
        value={{ toggleFullScreen, active: handle.active }}
      >
        {children}
      </FullScreenContext.Provider>
    </FullScreen>
  );
};

const useFullScreen = () => {
  return React.useContext(FullScreenContext);
};

export default useFullScreen;
