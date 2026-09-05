import i18n from "../../i18n";
import createItemTemplate from "../utils";

import Component from "./Counter";
import FormComponent from "./CounterFormFields";

const Template = createItemTemplate({
  type: "counter",
  component: Component,
  form: FormComponent,
  defaultActions: [
    "prevImage",
    "nextImage",
    "clone",
    "lock",
    "groupHide",
    "remove",
  ],
  availableActions: [
    "prevImage",
    "nextImage",
    "clone",
    "lock",
    "groupHide",
    "remove",
  ],
  name: i18n.t("Counter"),
  template: {
    value: 0,
    color: "#CCC",
    textColor: "#000",
    fontSize: "22",
  },
  resizeDirections: {},
});

export default Template;
