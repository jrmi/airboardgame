describe("Selection action", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/store/game*",
      },
      "[]"
    );
    cy.visit("/");
    cy.contains("0 Test game", { timeout: 10000 }).parent().find("img").click();
    // Way board loading
    cy.get(".board-pane", { timeout: 10000 }).should(
      "have.css",
      "transform",
      "matrix(0.48, 0, 0, 0.48, -11693.9, -11917.9)"
    );
    cy.get(".item")
      .first()
      .children()
      .first()
      .should("have.css", "transform", "none");
  });

  it("should select multiple items with left click ", () => {
    const posInit = {
      clientX: 400,
      clientY: 210,
    };
    cy.get(".board")
      .trigger("pointerdown", {
        button: 0,
        pointerId: 1,
        isPrimary: true,
        scrollBehavior: false,
        force: true,
        ...posInit,
      })
      .trigger("pointermove", {
        button: 0,
        force: true,
        pointerId: 1,
        isPrimary: true,
        scrollBehavior: false,
        clientX: posInit.clientX + 300,
        clientY: posInit.clientY + 250,
      });

    cy.get(".selection").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 498.08, 274.08)"
    );

    cy.get(".board").trigger("pointerup", {
      isPrimary: true,
      force: true,
    });

    cy.get("img[src='/game_assets/AS.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/game_assets/BH.jpg']")
      .parents(".item")
      .should("have.class", "selected");
  });
});
