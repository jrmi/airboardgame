import React from 'react';
import { useC2C } from './useC2C';

function useUsers() {
  const usersRef = React.useRef([]);
  const [users, setUsers] = React.useState([]);
  const [c2c, joined, isMaster] = useC2C();

  React.useEffect(() => {
    const unsub = [];
    if (joined) {
      console.log('joined');
      if (!isMaster) {
        c2c.call('getUserList').then((userList) => {
          //console.log('I am slave');
          usersRef.current = userList;
          setUsers(userList);
        });
      } else {
        unsub.push(
          c2c.register('getUserList', () => {
            return usersRef.current;
          })
        );
        unsub.push(
          c2c.subscribe('userLeave', (userId) => {
            console.log('userLeave');
            usersRef.current = usersRef.current.filter(
              ({ id }) => id !== userId
            );
            setUsers(usersRef.current);
            console.log('publish new user list', usersRef.current);
            c2c.publish('updateUserList', usersRef.current);
          })
        );
        unsub.push(
          c2c.subscribe('userUpdate', (user) => {
            if (usersRef.current.find((u) => u.id === user.id)) {
              const newUsers = usersRef.current.map((u) =>
                u.id === user.id ? user : u
              );
              usersRef.current = newUsers;
            } else {
              const newUsers = [...usersRef.current, user];
              usersRef.current = newUsers;
            }
            setUsers(usersRef.current);
            console.log('publish new user list', usersRef.current);
            c2c.publish('updateUserList', usersRef.current);
          })
        );
      }

      unsub.push(
        c2c.subscribe('updateUserList', (newList) => {
          console.log('User list', newList);
          usersRef.current = newList;
          setUsers(usersRef.current);
        })
      );
    }

    return () => {
      unsub.forEach((u) => u());
    };
  }, [joined, c2c, isMaster]);

  return users;
}

export default useUsers;
