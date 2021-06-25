import React from "react";
import { useRecoilValue } from "recoil";

import { Form } from "react-final-form";

import { ItemMapAtom, SelectedItemsAtom } from "../atoms";
import { useItems } from "./";

import AutoSave from "../../ui/formUtils/AutoSave";

export const getFormFieldComponent = (type, itemMap) => {
  if (type in itemMap) {
    return itemMap[type].form;
  }
  return () => null;
};

const ItemFormFactory = ({ ItemFormComponent }) => {
  const { batchUpdateItems } = useItems();

  const selectedItems = useRecoilValue(SelectedItemsAtom);
  const itemMap = useRecoilValue(ItemMapAtom);

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        ...formValues,
      }));
    },
    [batchUpdateItems, selectedItems]
  );

  return (
    <Form
      onSubmit={onSubmitHandler}
      render={() => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AutoSave save={onSubmitHandler} />
          <ItemFormComponent
            items={selectedItems.map((itemId) => itemMap[itemId])}
          />
        </div>
      )}
    />
  );
};

export default React.memo(ItemFormFactory);
