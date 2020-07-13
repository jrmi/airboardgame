import i18n from "../../../../i18n";

import Rect from "./Rect";
import Round from "./Round";
import Image from "./Image";
import Counter from "./Counter";
import Dice from "./Dice";
import Note from "./Note";
import Zone from "./Zone";

import ImageFormFields from "./forms/ImageFormFields";
import CounterFormFields from "./forms/CounterFormFields";
import RectFormFields from "./forms/RectFormFields";
import RoundFormFields from "./forms/RoundFormFields";
import DiceFormFields from "./forms/DiceFormFields";
import NoteFormFields from "./forms/NoteFormFields";
import ZoneFormFields from "./forms/ZoneFormFields";

export const itemMap = {
  rect: {
    component: Rect,
    defaultActions: ["lock", "remove"],
    form: RectFormFields,
    label: i18n.t("Rectangle"),
    template: {},
  },
  round: {
    component: Round,
    defaultActions: ["lock", "remove"],
    form: RoundFormFields,
    label: i18n.t("Round"),
    template: {},
  },
  image: {
    component: Image,
    defaultActions: (item) => {
      if (item.backContent) {
        return ["flip", "tap", "lock", "remove", "stack"];
      } else {
        return ["tap", "lock", "remove", "stack"];
      }
    },
    form: ImageFormFields,
    label: i18n.t("Image"),
    template: {},
  },
  counter: {
    component: Counter,
    defaultActions: ["lock", "remove"],
    form: CounterFormFields,
    label: i18n.t("Counter"),
    template: {},
  },
  dice: {
    component: Dice,
    defaultActions: ["lock", "remove"],
    form: DiceFormFields,
    label: i18n.t("Dice"),
    template: {},
  },
  note: {
    component: Note,
    defaultActions: ["lock", "remove"],
    form: NoteFormFields,
    label: i18n.t("Note"),
    template: {},
  },
  zone: {
    component: Zone,
    defaultActions: ["lock", "remove"],
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
