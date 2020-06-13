import { isCompositeComponentWithType } from 'react-dom/test-utils';

/**
 * Check if element or parent has className.
 * @param {DOMElement} element
 * @param {string} className
 */
export const insideClass = (element, className) => {
  if (element.className === className) return element;
  if (!element.parentNode) return false;
  return element.parentNode && insideClass(element.parentNode, className);
};

export const isPointInsideRect = (point, rect) => {
  return (
    point.x > rect.left &&
    point.x < rect.left + rect.width &&
    point.y > rect.top &&
    point.y < rect.top + rect.height
  );
};

export const isPointInsideItem = (point, item) => {
  return isPointInsideRect(point, {
    left: item.x,
    top: item.y,
    width: item.actualWidth,
    height: item.actualHeight,
  });
};
