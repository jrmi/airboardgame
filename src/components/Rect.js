import React from 'react';

export const Rect = ({
  color = '#DD0022',
  width = 10,
  height = 10,
  style,
  ...props
}) => (
  <div
    style={{
      ...style,
      width: `100%`,
      height: `100%`,
      backgroundColor: color,
    }}
    {...props}
  ></div>
);

export default Rect;
