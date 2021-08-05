import React from "react";
import { Form } from "react-final-form";

import AutoSave from "../../components/ui/formUtils/AutoSave";
import {
  useItemBaseActions,
  useSelectedItems,
  useItems,
} from "react-sync-board";

export const getFormFieldComponent = (type, itemMap) => {
  if (type in itemMap) {
    return itemMap[type].form;
  }
  return () => null;
};

const ItemFormFactory = ({ ItemFormComponent }) => {
  const { batchUpdateItems } = useItemBaseActions();
  const items = useItems();
  const selectedItems = useSelectedItems();

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
            items={items.filter(({ id }) => selectedItems.includes(id))}
          />
        </div>
      )}
    />
  );
};

export default React.memo(ItemFormFactory);
