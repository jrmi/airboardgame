import React from "react";

import ImageForm from "./ImageForm";

const ItemFormFactory = ({ item, onSubmitHandler }) => {
  switch (item.type) {
    case "image":
      return (
        <ImageForm initialValues={item} onSubmit={onSubmitHandler}></ImageForm>
      );
    default:
      return (
        <ImageForm initialValues={item} onSubmit={onSubmitHandler}></ImageForm>
      );
  }
};

export default ItemFormFactory;
