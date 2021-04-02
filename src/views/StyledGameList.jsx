import styled from "styled-components";

export const StyledGameList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 5%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  grid-auto-rows: minmax(100px, auto);

  @media screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 640px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

export const StyledGameFilters = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  li {
    flex: auto;
    max-width: 30rem;
    margin: 0 1rem;
  }

  input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="color"]):not([type="button"]):not([type="reset"]) {
    background-color: #1c1c1c;
    color: var(--font-color2);

    &::placeholder {
      color: var(--font-color2);
    }
  }
`;

export const StyledGameResultNumber = styled.p`
  text-align: center;
`;
