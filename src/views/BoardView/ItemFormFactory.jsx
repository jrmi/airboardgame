import React from "react";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";

import ItemForm, {
  getItemFormInitialValues,
} from "../../gameComponents/ItemForm";
import AutoSave from "../../ui/formUtils/AutoSave";

const ItemFormFactory = ({ onUpdate, items, extraExcludeFields }) => {
  const types = React.useMemo(
    () => Array.from(new Set(items.map(({ type }) => type))),
    [items]
  );
  const initialValues = React.useMemo(
    () => (items.length ? getItemFormInitialValues(items) : {}),
    [items]
  );

  // Fix a bug when asyncItems aren't up to date
  if (items.length === 0) {
    return null;
  }

  return (
    <Form
      onSubmit={onUpdate}
      initialValues={initialValues}
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
          <ItemForm
            items={items}
            types={types}
            extraExcludeFields={extraExcludeFields}
          />
          <AutoSave save={onUpdate} guardRotationInitialization />
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
