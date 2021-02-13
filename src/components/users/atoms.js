import { nanoid } from "nanoid";
import randomColor from "randomcolor";
import { atom } from "recoil";

export const getUser = () => {
  if (localStorage.user) {
    // Add some mandatory info if missing
    const localUser = {
      name: "Player",
      color: randomColor({ luminosity: "dark" }),
      uid: nanoid(),
      ...JSON.parse(localStorage.user),
    };
    // Id is given by server
    // delete localUser.id;
    persistUser(localUser);
    return localUser;
  }
  const newUser = {
    name: "Player",
    color: randomColor({ luminosity: "dark" }),
    uid: nanoid(),
  };
  persistUser(newUser);
  return newUser;
};

export const persistUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const userAtom = atom({
  key: "user",
  default: getUser(),
});

export const usersAtom = atom({
  key: "users",
  default: [],
});
