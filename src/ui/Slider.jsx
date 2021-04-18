import React from "react";
import RCSlider from "rc-slider";

import "rc-slider/assets/index.css";

export const sliderStyling = {
  trackStyle: [
    {
      backgroundColor: "var(--color-primary)",
      height: "5px",
    },
  ],
  railStyle: {
    backgroundColor: "var(--font-color2)",
  },
  handleStyle: [
    {
      backgroundColor: "white",
      borderColor: "white",
    },
    {
      backgroundColor: "white",
      borderColor: "white",
    },
  ],
};

// Please check https://github.com/react-component/slider#user-content-common-api
// for all available props.
// RCSlider refers to the Slider component of the rc-react library.
const Slider = (props) => {
  return <RCSlider {...props} {...sliderStyling} style={{ width: "20em" }} />;
};

export default Slider;
