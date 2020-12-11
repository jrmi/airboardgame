import saveGame from "./saveGame";

export const main = ({ store, functions }) => {
  // Add remote functions
  functions.saveGame = saveGame;
  functions.test = ({ store }) => {
    console.log("Test function call is a success", store);
  };
  // Declare store
  store.createOrUpdateBox("game", { security: "readOnly" });
  console.log("Setup loaded");
};

export default main;
