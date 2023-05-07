import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledNavButton = styled.button`
  display: block;
  background-color: transparent;
  padding: 4px;
  margin: 0;
  border: none;
  line-height: 0;
  color: ${({ active }) => (active ? "var(--color-primary)" : "white")};
`;

const NavButton = ({
  Icon,
  icon,
  onClick,
  to,
  alt,
  title,
  active,
  size = 28,
}) => {
  const navigate = useNavigate();
  const handleClick = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick(e);
      }
      if (to) {
        navigate(to);
      }
    },
    [onClick, to, navigate]
  );

  let component;
  if (Icon) {
    component = <Icon size={size} alt={alt} title={title} />;
  } else {
    const iconSrc =
      icon.startsWith("http") || icon.startsWith("/")
        ? icon
        : `https://icongr.am/entypo/${icon}.svg?size=${size}&color=f9fbfa`;

    component = <img src={iconSrc} alt={alt} title={title} width={size} />;
  }

  return (
    <StyledNavButton active={active} onClick={handleClick}>
      {component}
    </StyledNavButton>
  );
};

export default NavButton;
