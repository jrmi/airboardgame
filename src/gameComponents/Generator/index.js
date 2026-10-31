import i18n from "../../i18n";
import createItemTemplate from "../utils";

import Component from "./Generator";
import FormComponent from "./GeneratorFormFields";

const Template = createItemTemplate({
  type: "generator",
  component: Component,
  form: FormComponent,
  defaultActions: ["clone", "lock", "remove", "toggleTeamVisibility"],
  availableActions: ["clone", "lock", "remove", "toggleTeamVisibility"],
  excludeFields: { rotation: true },
  name: i18n.t("Generator"),
  translationKey: "Generator",
  template: { layer: 0, color: "#ccc" },
  resizeDirections: {},
});

export default Template;
