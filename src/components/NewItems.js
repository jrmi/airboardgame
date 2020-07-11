import React, { memo } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useRecoilCallback } from "recoil";

import { useItems } from "../components/Board/Items";
import { PanZoomRotateAtom } from "./Board";

const itemTypes = [
  i18n.t("Rectangle"),
  i18n.t("Image"),
  i18n.t("Round"),
  i18n.t("Note"),
  i18n.t("Counter"),
  i18n.t("Dice"),
];

const itemTemplates = {
  [i18n.t("Round")]: { type: "round" },
  [i18n.t("Rectangle")]: { type: "rect" },
  [i18n.t("Image")]: { type: "image" },
  [i18n.t("Note")]: { type: "note" },
  [i18n.t("Counter")]: { type: "counter" },
  [i18n.t("Dice")]: { type: "dice" },
};

const NewItem = memo(({ type }) => {
  const { t } = useTranslation();

  const { pushItem } = useItems();

  const addItem = useRecoilCallback(
    async (snapshot) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        ...itemTemplates[type],
        x: centerX,
        y: centerY,
        id: nanoid(),
      });
    },
    [pushItem]
  );
  return (
    <button
      className="button"
      style={{ display: "block", width: "100%" }}
      onClick={addItem}
    >
      {t(type)}
    </button>
  );
});

NewItem.displayName = "NewItem";

const NewItems = () => {
  return itemTypes.map((type) => <NewItem type={type} key={type} />);
};

export default memo(NewItems);
