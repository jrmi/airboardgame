import { uid } from "../utils";

const resize =
  (prop) =>
  ({ width, actualWidth, prevState }) => {
    let { [prop]: currentSize } = prevState;
    currentSize = parseFloat(currentSize);
    if (!currentSize || Number.isNaN(Number(currentSize))) {
      currentSize = actualWidth;
    }

    return {
      ...prevState,
      [prop]: (currentSize + width).toFixed(2),
    };
  };

export const sizeResize = resize("size");
export const radiusResize = resize("radius");

const defaultTemplate = () => ({
  resizeDirections: {
    w: true,
    h: true,
    b: true,
  },
  applyDefault(item) {
    return item;
  },
  // eslint-disable-next-line no-unused-vars
  mapMedia(item, fn) {},
});

export const createItemTemplate = (template) => {
  const itemTemplate =
    typeof template.template === "function"
      ? (...args) => ({
          grid: { show: true, color: "#000000", opacity: 0.2 },
          ...template.template(...args),
        })
      : {
          ...template.template,
          grid: {
            show: true,
            color: "#000000",
            opacity: 0.2,
            ...(template.template?.grid || {}),
          },
        };

  return Object.assign({}, defaultTemplate(), template, {
    id: uid(),
    template: itemTemplate,
  });
};

export default createItemTemplate;
