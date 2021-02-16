import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledBrand = styled.div`
  position: relative;
  display: inline-block;
  flex: 1;
  & h1 {
    font-weight: 700;
    font-size: 24px;
    & a {
      color: var(--font-color);
      padding: 0;
      display: inline;
    }
  }
  & span {
    color: var(--font-color);
    position: absolute;
    top: 5px;
    left: 175px;
    text-transform: uppercase;
    font-weight: 300;
    font-size: 1.5rem;
  }
`;

const Brand = () => (
  <StyledBrand>
    <h1>
      <Link to="/">Air Board Game</Link>
    </h1>
    <span>Beta</span>
  </StyledBrand>
);

export default Brand;
