console.log("Setud loaded");

const main = ({ store }) => {
  store.createOrUpdateBox("game", { security: "readOnly" });
  return {};
};
