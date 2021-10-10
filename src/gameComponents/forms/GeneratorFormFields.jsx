import React from "react";
import { useTranslation } from "react-i18next";
import { Field, useField } from "react-final-form";

import Label from "../../ui/formUtils/Label";
import itemTemplates from "../itemTemplates";
import ItemForm from "../ItemForm";

const Form = ({ initialValues }) => {
  const { t } = useTranslation();
  const {
    input: { value: itemType },
  } = useField("item.type", { initialValue: initialValues.item?.type });
  const {
    input: { value: item },
  } = useField("item", { initialValue: initialValues.item });

  console.log(itemType, item, initialValues);
  /*let ItemForm = () => null;
  if (itemType) {
    ItemForm = itemTemplates[itemType].form;
  }*/
  return (
    <>
      <Label>
        {t("Label")}
        <Field
          name="text"
          component="input"
          initialValue={initialValues.text}
        />
      </Label>

      <Label>
        {t("Item type")}
        <Field
          name="item.type"
          component="select"
          initialValue={initialValues.item?.type}
        >
          <option />
          {Object.keys(itemTemplates).map((key) => {
            return (
              <option key={key} value={key}>
                {itemTemplates[key].name}
              </option>
            );
          })}
        </Field>
      </Label>

      {/*itemType && (
        <ItemForm items={[item]} types={new Set([itemType])} prefix="item." />
      )*/}
    </>
  );
};

export default Form;
