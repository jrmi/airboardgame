import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StyledButton = styled.div.attrs(({ active }) => ({
  className: active ? "active" : "",
}))`
  border-radius: 100%;
  line-height: 1;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  border-color: transparent;
  color: var(--font-color);
  background-color: var(--color-midGrey);
  padding: 0.5rem;
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover,
  &.active {
    background-color: var(--color-primary);
  }
  box-shadow: 3px 3px 6px #00000050;
`;

const Touch = ({
  onClick = () => {},
  icon,
  title,
  alt,
  active,
  label,
  ...rest
}) => {
  // Touch icon
  return (
    <StyledWrapper {...rest}>
      <StyledButton onClick={onClick} active={active}>
        <img
          src={`https://icongr.am/entypo/${icon}.svg?size=24&color=f9fbfa`}
          alt={alt}
          title={title}
        />
      </StyledButton>
      {label && <span>{label}</span>}
    </StyledWrapper>
  );
};

export default Touch;
