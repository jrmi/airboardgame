import i18n from "../../i18n";

import Rect from "./Rect";
import Cube from "./Cube";
import Round from "./Round";
import Token from "./Token";
import Image from "./Image";
import Counter from "./Counter";
import Dice from "./Dice";
import Note from "./Note";
import Zone from "./Zone";
import Meeple from "./Meeple";
import Jewel from "./Jewel";
import Pawn from "./Pawn";
import CheckerBoard from "./CheckerBoard";

import ImageFormFields from "./forms/ImageFormFields";
import CounterFormFields from "./forms/CounterFormFields";
import RectFormFields from "./forms/RectFormFields";
import CubeFormFields from "./forms/CubeFormFields";
import RoundFormFields from "./forms/RoundFormFields";
import DiceFormFields from "./forms/DiceFormFields";
import NoteFormFields from "./forms/NoteFormFields";
import ZoneFormFields from "./forms/ZoneFormFields";
import TokenFormFields from "./forms/TokenFormFields";
import MeepleFormFields from "./forms/MeepleFormFields";
import JewelFormFields from "./forms/JewelFormFields";
import PawnFormFields from "./forms/PawnFormFields";
import CheckerBoardFormFields from "./forms/CheckerBoardFormFields";

export const itemMap = {
  rect: {
    component: Rect,
    defaultActions: ["lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: RectFormFields,
    label: i18n.t("Rectangle"),
    template: {},
  },
  cube: {
    component: Cube,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: CubeFormFields,
    label: i18n.t("Cube"),
    template: {},
  },
  round: {
    component: Round,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: RoundFormFields,
    label: i18n.t("Round"),
    template: {},
  },
  token: {
    component: Token,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: TokenFormFields,
    label: i18n.t("Token"),
    template: {},
  },
  meeple: {
    component: Meeple,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: MeepleFormFields,
    label: i18n.t("Meeple"),
    template: {},
  },
  pawn: {
    component: Pawn,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: PawnFormFields,
    label: i18n.t("Pawn"),
    template: {},
  },
  jewel: {
    component: Jewel,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["stack", "shuffle", "clone", "lock", "remove"],
    form: JewelFormFields,
    label: i18n.t("Jewel"),
    template: {},
  },
  checkerboard: {
    component: CheckerBoard,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: CheckerBoardFormFields,
    label: i18n.t("Checkerboard"),
    template: {},
  },
  image: {
    component: Image,
    defaultActions: (item) => {
      if (item.backContent) {
        return [
          "flip",
          "flipSelf",
          "tap",
          "stack",
          "shuffle",
          "clone",
          "lock",
          "remove",
        ];
      } else {
        return ["tap", "stack", "shuffle", "clone", "lock", "remove"];
      }
    },
    availableActions: (item) => {
      if (item.backContent) {
        return [
          "flip",
          "flipSelf",
          "tap",
          "rotate30",
          "rotate45",
          "rotate60",
          "rotate90",
          "rotate180",
          "stack",
          "shuffle",
          "randomlyRotate30",
          "randomlyRotate45",
          "randomlyRotate90",
          "randomlyRotate180",
          "clone",
          "lock",
          "remove",
        ];
      } else {
        return [
          "tap",
          "rotate30",
          "rotate45",
          "rotate60",
          "rotate90",
          "rotate180",
          "stack",
          "shuffle",
          "randomlyRotate30",
          "randomlyRotate45",
          "randomlyRotate90",
          "randomlyRotate180",
          "clone",
          "lock",
          "remove",
        ];
      }
    },
    form: ImageFormFields,
    label: i18n.t("Image"),
    template: {},
  },
  counter: {
    component: Counter,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: CounterFormFields,
    label: i18n.t("Counter"),
    template: {},
  },
  dice: {
    component: Dice,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: DiceFormFields,
    label: i18n.t("Dice"),
    template: {},
  },
  note: {
    component: Note,
    defaultActions: ["shuffle", "clone", "lock", "remove"],
    availableActions: ["shuffle", "clone", "lock", "remove"],
    form: NoteFormFields,
    label: i18n.t("Note"),
    template: {},
  },
  zone: {
    component: Zone,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: ZoneFormFields,
    label: i18n.t("Zone"),
    template: {},
  },
};

export const getFormFieldComponent = (type) => {
  if (type in itemMap) {
    return itemMap[type].form;
  }
  return () => null;
};

export const getComponent = (type) => {
  if (type in itemMap) {
    return itemMap[type].component;
  }
  return () => null;
};

export const getDefaultActionsFromItem = (item) => {
  if (item.type in itemMap) {
    const actions = itemMap[item.type].defaultActions;
    if (typeof actions === "function") {
      return actions(item);
    }
    return actions;
  }

  return [];
};

export const getAvailableActionsFromItem = (item) => {
  if (item.type in itemMap) {
    const actions = itemMap[item.type].availableActions;
    if (typeof actions === "function") {
      return actions(item);
    }
    return actions;
  }

  return [];
};

export const getActionsFromItem = (item) => {
  const { actions = getDefaultActionsFromItem(item) } = item;
  // Filter availableActions to keep same order
  return getAvailableActionsFromItem(item).filter((action) =>
    actions.includes(action)
  );
};
