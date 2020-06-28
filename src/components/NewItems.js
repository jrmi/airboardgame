import React, { memo } from "react";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

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

  const onClickHandler = () => {
    const newItem = {
      ...itemTemplates[type],
      x: 200,
      y: 50,
      id: nanoid(),
    };
    pushItem(newItem);
  };

  return (
    <button
      className="button"
      style={{ display: "block", width: "100%" }}
      onClick={onClickHandler}
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
