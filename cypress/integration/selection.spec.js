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
      "matrix(0.48, 0, 0, 0.48, 260, 60)"
    );
    cy.get(".item")
      .first()
      .children()
      .first()
      .should("have.css", "transform", "none");
  });

  it("should select multiple items with left click ", () => {
    cy.get(".board")
      .trigger("pointerdown", {
        x: 400,
        y: 400,
        button: 0,
        clientX: 400,
        clientY: 400,
        pointerId: 1,
        isPrimary: true,
      })
      .trigger("pointermove", {
        x: 700,
        y: 150,
        button: 0,
        clientX: 700,
        clientY: 150,
        force: true,
        pointerId: 1,
        isPrimary: true,
      });

    cy.get(".selector").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 291.667, 312.5)"
    );

    cy.get(".board").trigger("pointermove", {
      x: 601,
      y: 151,
      button: 0,
      clientX: 601,
      clientY: 151,
      pointerId: 1,
      isPrimary: true,
      force: true,
    });

    cy.wait(500);

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
