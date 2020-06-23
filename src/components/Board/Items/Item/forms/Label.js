import styled from "styled-components";

export const Label = styled.label`
  clear: both;
  padding-bottom: 1.5em;
  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export default Label;
