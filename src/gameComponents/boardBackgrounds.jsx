import React from "react";
import { useTranslation } from "react-i18next";

import i18n from "../i18n";
import { ImageField, media2Url } from "../mediaLibrary";

import ColorPicker from "../ui/formUtils/ColorPicker";

const drawToDataURL = (width, height, draw) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  draw(ctx);
  return canvas.toDataURL();
};

const ColorBgForm = ({ value, onChange }) => {
  const { t } = useTranslation();

  const onColorChange = (clr) => {
    onChange({ ...value, color: clr });
  };
  return (
    <label>
      {t("Color")}
      <ColorPicker value={value.color} onChange={onColorChange} />
    </label>
  );
};

const CustomBgForm = ({ value, onChange }) => {
  const { t } = useTranslation();

  const onImageChange = (imgVal) => {
    onChange({ ...value, img: imgVal });
  };
  const onColorChange = (clr) => {
    onChange({ ...value, color: clr });
  };
  return (
    <>
      <label>
        {t("Color")}
        <ColorPicker value={value.color} onChange={onColorChange} />
      </label>
      <label>
        {t("Image")}
        <ImageField value={value.img} onChange={onImageChange} />
      </label>
    </>
  );
};

const backgrounds = [
  {
    type: "default",
    name: i18n.t("Default"),
    form: null,
    getStyle() {
      return {
        background:
          "radial-gradient(circle, hsla(218, 30%, 40%, 0.7), hsla(218, 40%, 40%, 0.1) 50%),  url(/board.png)",
      };
    },
  },
  {
    type: "grid",
    name: i18n.t("Grid"),
    form: ColorBgForm,
    getStyle({ color = "#269" } = {}) {
      // Create grid background
      const dataUrl = drawToDataURL(200, 200, (ctx) => {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.moveTo(200, 2);
        ctx.lineTo(2, 2);
        ctx.lineTo(2, 200);
        ctx.stroke();
      });
      return {
        backgroundColor: color,
        backgroundImage: `url(${dataUrl})`,
      };
    },
  },
  {
    type: "dot",
    name: i18n.t("Dot"),
    form: ColorBgForm,
    getStyle({ color = "#ccc" } = {}) {
      const dotColor = "#ffffff11";
      const style = {
        backgroundImage: `radial-gradient(${dotColor} 30%, transparent 20%), radial-gradient(${dotColor} 30%, transparent 20%)`,
        backgroundColor: color,
        backgroundPosition: "0 0, 100px 100px",
        backgroundSize: "200px 200px",
      };
      return style;
    },
  },
  {
    type: "square",
    name: i18n.t("Square"),
    form: ColorBgForm,
    getStyle({ color = "#269" } = {}) {
      const dataUrl = drawToDataURL(100, 100, (ctx) => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, 50, 50);
      });
      return {
        backgroundColor: color,
        backgroundImage: `url(${dataUrl})`,
      };
    },
  },
  {
    type: "hstripe",
    name: i18n.t("Horizontal Stripe"),
    form: ColorBgForm,
    getStyle({ color = "#269" } = {}) {
      const dataUrl = drawToDataURL(200, 200, (ctx) => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, 200, 100);
      });
      return {
        backgroundColor: color,
        backgroundImage: `url(${dataUrl})`,
      };
    },
  },
  {
    type: "vstripe",
    name: i18n.t("Vertical Stripe"),
    form: ColorBgForm,
    getStyle({ color = "#269" } = {}) {
      const dataUrl = drawToDataURL(200, 200, (ctx) => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, 100, 200);
      });
      return {
        backgroundColor: color,
        backgroundImage: `url(${dataUrl})`,
      };
    },
  },
  {
    type: "xstripe",
    name: i18n.t("Crossed stripes"),
    form: ColorBgForm,
    getStyle({ color = "#269" } = {}) {
      const dataUrl = drawToDataURL(200, 200, (ctx) => {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, 100, 200);
        ctx.fillRect(0, 0, 200, 100);
      });
      return {
        backgroundColor: color,
        backgroundImage: `url(${dataUrl})`,
      };
    },
  },
  {
    type: "custom",
    name: i18n.t("Custom"),
    form: CustomBgForm,
    getStyle({ color = "#ccc", img = {} } = {}) {
      const style = {
        backgroundColor: color,
      };
      if (img.type) {
        const url = media2Url(img);
        if (url) {
          style.backgroundImage = `url(${url})`;
        }
      }
      return style;
    },
  },
];

export default backgrounds;
