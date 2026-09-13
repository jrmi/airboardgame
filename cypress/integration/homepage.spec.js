describe("Homepage", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/store/game*",
      },
      "[]"
    );
    cy.visit("/");
  });

  it("should show all available games by default", () => {
    cy.contains("0 Test game").should("be.visible");
    cy.contains("1 Performance game to test strange things and other").should(
      "be.visible"
    );
  });

  it("should show both default games if searching for 'test' string", () => {
    cy.get('input[name="game-search"]').type("test");
    cy.contains("0 Test game").should("be.visible");
    cy.contains("1 Performance game to test strange things and other").should(
      "be.visible"
    );
  });

  it("should show only game 1 if searching for 'Performance' string", () => {
    cy.get('input[name="game-search"]').type("Performance");
    cy.contains("0 Test game").should("not.exist");
    cy.contains("1 Performance game to test strange things and other").should(
      "be.visible"
    );
  });

  it("should not show any game for 'thisisafancystring' string", () => {
    cy.get('input[name="game-search"]').type("thisisafancystring");
    cy.contains("0 Test game").should("not.exist");
    cy.contains("1 Performance game to test strange things and other").should(
      "not.exist"
    );
  });

  it("should not show unpublished game by default", () => {
    cy.contains("2 Unpublished game").should("not.exist");
  });

  it("should only show the Perf game (1-9+ playerds) and not the Test game (2-4 players) when selecting 5-9 players range", () => {
    cy.get(".player-filter .rc-slider-handle").first().focus();
    cy.get(".player-filter .rc-slider-handle")
      .first()
      .type("{rightarrow}{rightarrow}{rightarrow}{rightarrow}");
    cy.contains("0 Test game").should("not.exist");
    cy.contains("1 Performance game to test strange things and other").should(
      "be.visible"
    );
  });
});
