import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledNavButton = styled.button`
  display: inline-block;
  background-color: transparent;
  padding: 0;
`;

const NavButton = ({ Icon, icon, onClick, to, alt, title }) => {
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
    component = <Icon size={24} alt={alt} title={title} />;
  } else {
    const iconSrc =
      icon.startsWith("http") || icon.startsWith("/")
        ? icon
        : `https://icongr.am/entypo/${icon}.svg?size=24&color=f9fbfa`;

    component = <img src={iconSrc} alt={alt} title={title} width="24" />;
  }

  return <StyledNavButton onClick={handleClick}>{component}</StyledNavButton>;
};

export default NavButton;
