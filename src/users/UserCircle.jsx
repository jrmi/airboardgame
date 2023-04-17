import React from "react";

import styled from "styled-components";

const StyledUserCircle = styled.div`
  background-color: ${({ color }) => color};
  width: 30px;
  min-width: 30px;
  height: 30px;
  margin: 2px;
  border-radius: 100%;
  text-align: center;
  line-height: 30px;
  text-transform: capitalize;
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
  let pre = name.slice(0, 2).toLowerCase();
  return <StyledUserCircle {...rest}>{pre}</StyledUserCircle>;
};

export default UserCircle;
