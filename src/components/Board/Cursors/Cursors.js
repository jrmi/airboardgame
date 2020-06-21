import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import Cursor from "./Cursor";

export const Cursors = ({ users }) => {
  const [c2c] = useC2C();
  const [cursors, setCursors] = React.useState({});

  const usersById = React.useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [users]);

  // Prevent race condition when removing user
  const currentCursor = React.useMemo(() => {
    return users.reduce((acc, user) => {
      if (cursors[user.id]) {
        acc[user.id] = cursors[user.id];
      }
      return acc;
    }, {});
  }, [users, cursors]);

  React.useEffect(() => {
    setCursors((prevCursors) => {
      return users.reduce((acc, user) => {
        if (prevCursors[user.id]) {
          acc[user.id] = prevCursors[user.id];
        }
        return acc;
      }, {});
    });
  }, [users]);

  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      c2c.subscribe("cursorMove", ({ userId, pos }) => {
        setCursors((prevCursors) => {
          return {
            ...prevCursors,
            [userId]: pos,
          };
        });
      })
    );
    unsub.push(
      c2c.subscribe("cursorOff", ({ userId }) => {
        setCursors((prevCursors) => {
          const newCursors = {
            ...prevCursors,
          };
          delete newCursors[userId];
          return newCursors;
        });
      })
    );
    return () => {
      unsub.map((c) => c());
    };
  }, [c2c]);

  return (
    <div>
      {Object.entries(currentCursor).map(([userId, pos]) => (
        <Cursor
          key={userId}
          pos={pos}
          text={usersById[userId].name}
          color={usersById[userId].color}
        />
      ))}
    </div>
  );
};

export default Cursors;
