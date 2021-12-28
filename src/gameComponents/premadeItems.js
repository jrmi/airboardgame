import i18n from "../i18n";

const colors = [
  { name: i18n.t("Black"), value: "#111111" },
  { name: i18n.t("White"), value: "#EEEEEE" },
  { name: i18n.t("Red"), value: "#D82735" },
  { name: i18n.t("Orange"), value: "#FF7435" },
  { name: i18n.t("Yellow"), value: "#F9DF00" },
  { name: i18n.t("Green"), value: "#006B2A" },
  { name: i18n.t("Blue"), value: "#275791" },
  { name: i18n.t("Purple"), value: "#5F3581" },
];

const premade = [];

const pawns = {
  name: i18n.t("Pawn"),
  items: [],
};
premade.push(pawns);

colors.forEach(({ name, value }) => {
  pawns.items.push({
    type: "pawn",
    name: i18n.t("{{color}} pawn", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const token = {
  name: i18n.t("Token"),
  items: [],
};
premade.push(token);

colors.forEach(({ name, value }) => {
  token.items.push({
    type: "token",
    name: i18n.t("{{color}} token", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const cube = {
  name: i18n.t("Cube"),
  items: [],
};
premade.push(cube);

colors.forEach(({ name, value }) => {
  cube.items.push({
    type: "cube",
    name: i18n.t("{{color}} cube", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const cylinder = {
  name: i18n.t("Cylinder"),
  items: [],
};
premade.push(cylinder);

colors.forEach(({ name, value }) => {
  cylinder.items.push({
    type: "cylinder",
    name: i18n.t("{{color}} cylinder", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const meeple = {
  name: i18n.t("Meeple"),
  items: [],
};
premade.push(meeple);

colors.forEach(({ name, value }) => {
  meeple.items.push({
    type: "meeple",
    name: i18n.t("{{color}} meeple", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const jewel = {
  name: i18n.t("Jewel"),
  items: [],
};
premade.push(jewel);

colors.forEach(({ name, value }) => {
  jewel.items.push({
    type: "jewel",
    name: i18n.t("{{color}} jewel", { color: name.toLocaleLowerCase() }),
    color: value,
  });
});

const boards = {
  name: i18n.t("Board"),
  items: [],
};
premade.push(boards);

boards.items.push({
  type: "checkerboard",
  name: i18n.t("8x8 board"),
  color: colors[0].value,
  alternateColor: colors[1].value,
  width: 500,
  colCount: 8,
  rowCount: 8,
});

export default premade;
