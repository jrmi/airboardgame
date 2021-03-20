import React from "react";

import styled from "styled-components";

const StyledUserCircle = styled.div`
  background-color: ${({ color }) => color};
  width: 38px;
  min-width: 38px;
  height: 38px;
  margin: 2px;
  border-radius: 100%;
  text-align: center;
  line-height: 38px;
  ${({ isSelf }) => (isSelf ? "text-decoration: underline;" : "")};
  cursor: ${({ isSelf }) => (isSelf ? "pointer" : "default")};

  &:hover {
    ${({ isSelf }) => (isSelf ? "filter: brightness(125%);" : "")}
  }

  @media screen and (max-width: 640px) {
    & {
      font-size: 0.5em;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
  }
`;

const UserCircle = ({ name, ...rest }) => {
  const pre = name[0].toUpperCase() + name[1].toLowerCase();
  return <StyledUserCircle {...rest}>{pre}</StyledUserCircle>;
};

export default UserCircle;
