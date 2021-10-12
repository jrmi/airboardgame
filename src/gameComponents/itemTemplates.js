import i18n from "../i18n";

import { uid } from "../utils";

import Rect from "./Rect";
import Cube from "./Cube";
import Round from "./Round";
import Token from "./Token";
import Image from "./Image";
import Counter from "./Counter";
import Dice from "./Dice";
import DiceImage from "./DiceImage";
import Note from "./Note";
import Zone from "./Zone";
import Meeple from "./Meeple";
import Jewel from "./Jewel";
import Pawn from "./Pawn";
import CheckerBoard from "./CheckerBoard";
import Cylinder from "./Cylinder";
import Generator from "./Generator";

import ImageFormFields from "./forms/ImageFormFields";
import CounterFormFields from "./forms/CounterFormFields";
import RectFormFields from "./forms/RectFormFields";
import CubeFormFields from "./forms/CubeFormFields";
import RoundFormFields from "./forms/RoundFormFields";
import DiceFormFields from "./forms/DiceFormFields";
import DiceImageFormFields from "./forms/DiceImageFormFields";
import NoteFormFields from "./forms/NoteFormFields";
import ZoneFormFields from "./forms/ZoneFormFields";
import TokenFormFields from "./forms/TokenFormFields";
import MeepleFormFields from "./forms/MeepleFormFields";
import JewelFormFields from "./forms/JewelFormFields";
import PawnFormFields from "./forms/PawnFormFields";
import CheckerBoardFormFields from "./forms/CheckerBoardFormFields";
import CylinderFormFields from "./forms/CylinderFormFields";
import GeneratorFormFields from "./forms/GeneratorFormFields";

const defaultDiceImages = () => [
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/one.svg",
  },
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/two.svg",
  },
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/three.svg",
  },
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/four.svg",
  },
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/five.svg",
  },
  {
    id: uid(),
    type: "external",
    content: "/game_assets/dice/six.svg",
  },
];

const itemTemplates = {
  rect: {
    component: Rect,
    defaultActions: ["lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: RectFormFields,
    name: i18n.t("Rectangle"),
    template: {},
  },
  cube: {
    component: Cube,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: CubeFormFields,
    name: i18n.t("Cube"),
    template: {},
  },
  cylinder: {
    component: Cylinder,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: CylinderFormFields,
    name: i18n.t("Cylinder"),
    template: {},
  },
  round: {
    component: Round,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: RoundFormFields,
    name: i18n.t("Round"),
    template: {},
  },
  token: {
    component: Token,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: TokenFormFields,
    name: i18n.t("Token"),
    template: {},
  },
  meeple: {
    component: Meeple,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: MeepleFormFields,
    name: i18n.t("Meeple"),
    template: {},
  },
  pawn: {
    component: Pawn,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: PawnFormFields,
    name: i18n.t("Pawn"),
    template: {},
  },
  jewel: {
    component: Jewel,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "stack",
      "alignAsLine",
      "alignAsSquare",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
    form: JewelFormFields,
    name: i18n.t("Jewel"),
    template: {},
  },
  checkerboard: {
    component: CheckerBoard,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: CheckerBoardFormFields,
    name: i18n.t("Checkerboard"),
    template: {
      layer: -1,
    },
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
          "rotate",
          "randomlyRotate",
          "stack",
          "alignAsLine",
          "alignAsSquare",
          "shuffle",
          "clone",
          "lock",
          "remove",
        ];
      } else {
        return [
          "tap",
          "rotate",
          "randomlyRotate",
          "stack",
          "alignAsLine",
          "alignAsSquare",
          "shuffle",
          "clone",
          "lock",
          "remove",
        ];
      }
    },
    form: ImageFormFields,
    name: i18n.t("Image"),
    template: {},
  },
  counter: {
    component: Counter,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: CounterFormFields,
    name: i18n.t("Counter"),
    template: {},
  },
  dice: {
    component: Dice,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "clone",
      "lock",
      "remove",
      "alignAsLine",
      "alignAsSquare",
    ],
    form: DiceFormFields,
    name: i18n.t("Dice"),
    template: {},
  },
  diceImage: {
    component: DiceImage,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "clone",
      "lock",
      "remove",
      "alignAsLine",
      "alignAsSquare",
    ],
    form: DiceImageFormFields,
    name: i18n.t("Image dice"),
    template: () => ({
      images: defaultDiceImages(),
      side: 6,
    }),
  },
  note: {
    component: Note,
    defaultActions: ["shuffle", "clone", "lock", "remove"],
    availableActions: [
      "shuffle",
      "clone",
      "lock",
      "remove",
      "alignAsLine",
      "alignAsSquare",
    ],
    form: NoteFormFields,
    name: i18n.t("Note"),
    template: {},
  },
  zone: {
    component: Zone,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: [
      "clone",
      "lock",
      "remove",
      "alignAsLine",
      "alignAsSquare",
    ],
    form: ZoneFormFields,
    name: i18n.t("Zone"),
    template: {
      layer: -1,
    },
  },
  generator: {
    component: Generator,
    defaultActions: ["clone", "lock", "remove"],
    availableActions: ["clone", "lock", "remove"],
    form: GeneratorFormFields,
    excludeFields: { rotation: true },
    name: i18n.t("Generator"),
    template: {
      layer: -1,
    },
  },
};

export const itemLibrary = Object.keys(itemTemplates).map((key) => ({
  type: key,
  ...itemTemplates[key],
  uid: uid(),
}));

export default itemTemplates;
