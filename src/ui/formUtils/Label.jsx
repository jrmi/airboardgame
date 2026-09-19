import styled from "styled-components";

export const Label = styled.label`
  clear: both;
  display: block;
  color: var(--font-color);
  font-size: 0.95em;
  font-weight: 500;
  line-height: 1.4;
  padding-bottom: 1.2em;

  &
    > input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not(
      [type="color"]
    ):not([type="button"]):not([type="reset"]),
  & > select,
  & > textarea {
    display: block;
    margin-top: 0.45em;
    width: 100%;
  }

  & > input[type="checkbox"],
  & > input[type="radio"] {
    margin-left: 0.6em;
    vertical-align: middle;
  }

  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

export default Label;
