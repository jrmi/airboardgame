import React from "react";
import { Range } from "rc-slider";

import "rc-slider/assets/index.css";

import { sliderStyling } from "./Slider";
import { StyledSliderRange } from "./StyledSliderRange";

// Please check https://github.com/react-component/slider#user-content-common-api
// for all available props.
const SliderRange = (props) => {
  const [minMaxValues, setMinMaxValues] = React.useState({ min: 1, max: 9 });

  const onChangeCustom = function (values) {
    setMinMaxValues({
      min: values[0],
      max: values[1],
    });
    props.onChange(values);
  };

  return (
    <StyledSliderRange>
      <span>{`${minMaxValues.min}`}</span>
      <Range
        {...props}
        {...sliderStyling}
        style={{
          width: "20em",
        }}
        onChange={onChangeCustom}
      />
      <span>{`${minMaxValues.max}`}</span>
    </StyledSliderRange>
  );
};

export default SliderRange;
