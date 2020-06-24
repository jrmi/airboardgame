import React, { memo } from "react";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";

const itemTypes = ["rect", "round", "image", "note", "counter", "dice"];

const itemTemplates = {
  round: {},
  rect: {},
  image: {},
  note: {},
  counter: {},
  dice: {},
};

const NewItem = memo(({ type }) => {
  const { t } = useTranslation();

  const { pushItem } = useItems();

  const onClickHandler = () => {
    const newItem = {
      ...itemTemplates[type],
      type,
      x: 200,
      y: 50,
      id: nanoid(),
    };
    pushItem(newItem);
  };

  return (
    <button style={{ cursor: "pointer" }} onClick={onClickHandler}>
      {t(type)}
    </button>
  );
});

NewItem.displayName = "NewItem";

const NewItems = () => {
  return (
    <ul style={{ textAlign: "left", listStyle: "none" }}>
      {itemTypes.map((type) => (
        <li key={type}>
          <NewItem type={type} />
        </li>
      ))}
    </ul>
  );
};

export default memo(NewItems);
