import React from "react";
import { Form } from "react-final-form";
import arrayMutators from "final-form-arrays";

import ItemForm from "../../gameComponents/ItemForm";
import AutoSave from "../../ui/formUtils/AutoSave";

const ItemFormFactory = ({ onUpdate, items, extraExcludeFields = {} }) => {
  const types = React.useMemo(
    () => Array.from(new Set(items.map(({ type }) => type))),
    [items]
  );

  return (
    <Form
      onSubmit={onUpdate}
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
          <AutoSave save={onUpdate} />
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
