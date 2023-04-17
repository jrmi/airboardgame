import styled from "styled-components";

const StyledNavBar = styled.div`
  position: fixed;
  top: 0;
  ${({ fullHeight = true }) => (fullHeight ? "height: 100%;" : "")}
  z-index: 205;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding: 10px 0;
  width: 40px;

  background-color: #19202ce0;

  ${({ position = "left" }) => {
    if (position === "left") {
      return `
      left: 0;
    `;
    } else {
      return `
      right: 0;
      `;
    }
  }}

  .blurry & {
    filter: blur(2px) grayscale(50%);
  }

  color: var(--font-color);

  & .spacer {
    flex: 1;
  }

  & .sep {
    height: 1.5em;
    width: 80%;
  }

  @media screen and (max-width: 640px) {
  }
`;

export default StyledNavBar;
