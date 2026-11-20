import i18n from "../../i18n";
import createItemTemplate from "../utils";

import AdvancedImage from "./AdvancedImage";
import AdvancedImageFormFields from "./AdvancedImageFormFields";

const RectTemplate = createItemTemplate({
  type: "advancedImage",
  component: AdvancedImage,
  defaultActions: (item) => {
    let actions = [
      "stack",
      "shuffle",
      "clone",
      "lock",
      "remove",
      "toggleTeamVisibility",
    ];
    if (item.layers?.length) {
      actions = ["nextImage"].concat(actions);
    }
    if (item.back) {
      return ["flip", "flipSelf"].concat(actions);
    } else {
      return actions;
    }
  },
  availableActions: (item) => {
    let actions = [
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
      "toggleTeamVisibility",
    ];
    if (item.layers?.length) {
      actions = ["prevImageForLayer", "nextImageForLayer", "rollLayer"].concat(
        actions
      );
    }
    if (item.back) {
      return ["flip", "flipSelf"].concat(actions);
    } else {
      return actions;
    }
  },
  form: AdvancedImageFormFields,
  name: i18n.t("Advanced Image"),
  translationKey: "Advanced Image",
  template: { layers: [], front: "/default.png" },
  async mapMedia(item, fn) {
    const mapImage = async (image) => {
      const mapped = await fn(image);
      return image?.uid && mapped && typeof mapped === "object"
        ? { ...mapped, uid: image.uid }
        : mapped;
    };
    const [front, back] = await Promise.all([
      mapImage(item.front),
      mapImage(item.back),
    ]);
    item.front = front;
    item.back = back;
    item.layers = await Promise.all(
      (item.layers || []).map(async (layer) => ({
        ...layer,
        images: await Promise.all((layer.images || []).map(mapImage)),
      }))
    );
  },
});

export default RectTemplate;
