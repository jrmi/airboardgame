import { uid } from "../utils";

const resize = (prop) => ({ width, actualWidth, prevState }) => {
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

const defaultTemplate = {
  resizeDirections: {
    w: true,
    h: true,
    b: true,
  },
  applyDefault(item) {
    return item;
  },
};

export const createItemTemplate = (template) => {
  return Object.assign(
    {},
    JSON.parse(JSON.stringify(defaultTemplate)),
    template,
    { uid: uid() }
  );
};

export default createItemTemplate;
