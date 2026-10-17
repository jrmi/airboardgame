import React from "react";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";

import ItemForm, {
  getItemFormInitialValues,
} from "../../gameComponents/ItemForm";
import AutoSave from "../../ui/formUtils/AutoSave";

const ItemFormFactory = ({
  onUpdate,
  onRotate,
  onResetRotation,
  items,
  extraExcludeFields,
}) => {
  const types = React.useMemo(
    () => Array.from(new Set(items.map(({ type }) => type))),
    [items]
  );
  const initialValues = React.useMemo(() => {
    if (!items.length) return {};
    const values = getItemFormInitialValues(items);
    if (items.length > 1) delete values.rotation;
    return values;
  }, [items]);

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
            onRotate={onRotate}
            onResetRotation={onResetRotation}
          />
          <AutoSave save={onUpdate} guardRotationInitialization />
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
