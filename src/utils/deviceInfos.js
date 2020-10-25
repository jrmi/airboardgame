import platform from "platform";

export const isMacOS = () => {
  return platform.os.family === "OS X";
};
