import React from "react";
import { Range } from "rc-slider";
import styled from "styled-components";

import "rc-slider/assets/index.css";

import { sliderStyling } from "./Slider";

const StyledSliderRange = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > span {
    margin: 1em;
    color: var(--font-color2);
  }
`;

// Please check https://github.com/react-component/slider#user-content-common-api
// for all available props.
const SliderRange = ({ defaultValue: [min, max], ...props }) => {
  const [minMaxValues, setMinMaxValues] = React.useState([min, max]);

  const onChangeCustom = function (values) {
    setMinMaxValues(values);
    props.onChange(values);
  };

  return (
    <StyledSliderRange>
      <span>{`${minMaxValues[0]}`}</span>
      <Range
        {...props}
        {...sliderStyling}
        min={min}
        max={max}
        style={{
          width: "20em",
        }}
        onChange={onChangeCustom}
      />
      <span>{`${minMaxValues[1]}`}</span>
    </StyledSliderRange>
  );
};

export default SliderRange;
