import React from "react";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";

import AutoSave from "../../ui/formUtils/AutoSave";
import { useItemActions, useSelectedItems, useItems } from "react-sync-board";

const ItemFormFactory = ({ ItemFormComponent }) => {
  const { batchUpdateItems } = useItemActions();
  const items = useItems();
  const selectedItems = useSelectedItems();

  const currentItems = React.useMemo(
    () => items.filter(({ id }) => selectedItems.includes(id)),
    [items, selectedItems]
  );

  const types = React.useMemo(
    () => new Set(currentItems.map(({ type }) => type)),
    [currentItems]
  );

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      batchUpdateItems(selectedItems, (item) => {
        return {
          ...item,
          ...formValues,
        };
      });
    },
    [batchUpdateItems, selectedItems]
  );

  return (
    <Form
      onSubmit={onSubmitHandler}
      mutators={{
        ...arrayMutators,
      }}
      render={() => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AutoSave save={onSubmitHandler} />
          <ItemFormComponent items={currentItems} types={types} />
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
