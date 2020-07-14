import React from "react";
import { darken } from "color2k";

const Token = ({ size = 50, color = "#b3b3b3" }) => {
  const colorDarken1 = darken(color, 0.2);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 13.229166 13.229167"
      height={size}
      width={size}
    >
      <defs id="defs3685">
        <filter
          height="1.3069763"
          y="-0.15348813"
          width="1.2587371"
          x="-0.12936857"
          id="filter1545"
          style={{ colorInterpolationFilters: "sRGB" }}
        >
          <feGaussianBlur id="feGaussianBlur1547" stdDeviation="1.4261986" />
        </filter>
      </defs>
      <g transform="translate(0,-283.77082)" id="layer1">
        <g
          id="g2141"
          transform="matrix(1.912301,0,0,1.9415926,-37.524141,278.17372)"
        >
          <ellipse
            transform="matrix(0.21715179,0,0,0.20089972,16.183496,0.63070104)"
            style={{
              opacity: 0.4,
              fill: "#000000",
              filter: "url(#filter1545)",
            }}
            id="ellipse2135"
            cx="31.7122"
            cy="28.977083"
            rx="13.229166"
            ry="11.150297"
          />
          <ellipse
            ry="2.2400916"
            rx="2.8727372"
            cy="6.1725774"
            cx="23.069857"
            id="ellipse2137"
            fill={colorDarken1}
          />
          <ellipse
            ry="2.2400916"
            rx="2.9137762"
            cy="5.5801239"
            cx="23.086393"
            id="ellipse2139"
            fill={color}
          />
        </g>
      </g>
    </svg>
  );
};

export default Token;
