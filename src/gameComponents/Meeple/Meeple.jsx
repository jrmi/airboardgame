import React from "react";
import { darken } from "color2k";

const Meeple = ({ size = 50, color = "#b3b3b3" }) => {
  const colorDarken1 = darken(color, 0.2);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="1 1 11 7"
      height={size}
      width={size}
    >
      <defs id="defs3017">
        <filter
          height="3.1452308"
          y="-1.0726153"
          width="1.3983999"
          x="-0.1992"
          id="filter2060"
          style={{ colorInterpolationFilters: "sRGB" }}
        >
          <feGaussianBlur id="feGaussianBlur2062" stdDeviation="0.34490875" />
        </filter>
      </defs>
      <g transform="translate(-0.0294818,-283.86486)" id="layer1">
        <path
          fill={colorDarken1}
          d="m 3.0979662,292.2418 c -0.2874494,-0.53334 0.1413803,-1.08799 0.3158591,-1.58532 0.3296553,-0.68402 0.7666358,-1.31614 1.0141344,-2.03961 -0.1490216,-0.57838 -0.8779649,-0.23724 -1.2811215,-0.41603 -0.5233214,-0.12715 -0.6982117,-0.87469 -0.3177725,-1.24847 0.4453052,-0.5382 1.1344513,-0.75603 1.7494532,-1.02135 0.4237572,-0.0791 0.9796117,-0.22301 0.898101,-0.77349 0.067452,-0.52908 0.3488472,-1.10395 0.9028892,-1.23523 0.5734343,-0.17897 1.3057167,0.0652 1.5302245,0.66384 0.2515631,0.34753 -0.00373,0.9284 0.4103041,1.16589 0.6821913,0.16874 1.3633886,0.42551 1.9560273,0.81894 0.462596,0.25909 0.870823,0.85345 0.515062,1.36894 -0.329912,0.42607 -0.9264519,0.27441 -1.3878831,0.36874 -0.528765,0.0674 -0.1300115,0.75658 0.05102,1.03836 0.274265,0.51706 0.5494041,1.03576 0.8025021,1.56491 0.116639,0.40657 0.547568,1.00669 0.119543,1.33553 -0.5213765,0.16029 -1.0861552,0.0169 -1.6259055,0.0677 -0.4511138,0.0283 -0.9489904,-0.009 -1.150321,-0.48918 -0.2521191,-0.36581 -0.3938815,-0.84377 -0.7643947,-1.10438 -0.4390259,-0.0123 -0.4998957,0.61144 -0.7563837,0.88348 -0.204252,0.40235 -0.4206867,0.72448 -0.9958527,0.70074 -0.5751644,-0.0237 -1.3032255,0.0288 -1.9460747,-0.0523 l -0.022567,-0.007 z"
          id="path1808"
        />
        <path
          id="path1822"
          d="m 3.4536146,292.64403 c -0.287451,-0.53334 0.1413803,-1.08799 0.3158575,-1.58532 0.3296569,-0.68402 0.7666373,-1.31614 1.0141344,-2.03961 -0.1490216,-0.57837 -0.8779649,-0.23723 -1.2811215,-0.41602 -0.5233214,-0.12716 -0.6982117,-0.8747 -0.3177725,-1.24848 0.4453067,-0.5382 1.1344513,-0.75602 1.7494532,-1.02135 0.4237572,-0.0792 0.9796132,-0.22301 0.898101,-0.77348 0.067452,-0.52909 0.3488472,-1.10396 0.9028908,-1.23524 0.5734327,-0.17897 1.3057167,0.0652 1.5302229,0.66384 0.2515631,0.34753 -0.00373,0.9284 0.4103041,1.16589 0.6821928,0.16874 1.3633885,0.42551 1.9560275,0.81894 0.462597,0.25909 0.870823,0.85345 0.515063,1.36894 -0.329913,0.42607 -0.926452,0.27441 -1.3878843,0.36874 -0.528765,0.0674 -0.1300115,0.75658 0.05102,1.03836 0.2742653,0.51706 0.5494043,1.03576 0.8025003,1.56492 0.116639,0.40657 0.547569,1.00668 0.119543,1.33552 -0.521376,0.1603 -1.0861534,0.0169 -1.6259037,0.0677 -0.4511153,0.0283 -0.9489904,-0.009 -1.150321,-0.48919 -0.2521207,-0.36581 -0.393883,-0.84377 -0.7643947,-1.10438 -0.4390275,-0.0123 -0.4998957,0.61145 -0.7563837,0.88348 -0.2042536,0.40235 -0.4206883,0.72449 -0.9958527,0.70074 -0.5751644,-0.0237 -1.3032255,0.0288 -1.9460747,-0.0523 l -0.022567,-0.007 z"
          fill={color}
        />
      </g>
    </svg>
  );
};

export default Meeple;