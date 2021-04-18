describe("Selection action", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("0 Test game", { timeout: 10000 }).parent().find("img").click();
    // Way board loading
    cy.get(".board-pane", { timeout: 10000 }).should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
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
        x: 350,
        y: 500,
        button: 0,
        clientX: 350,
        clientY: 500,
        isPrimary: true,
      })
      .trigger("pointermove", {
        x: 600,
        y: 150,
        button: 0,
        clientX: 600,
        clientY: 150,
        force: true,
        isPrimary: true,
      });

    cy.get(".selector").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 350, 350)"
    );

    cy.get(".board").trigger("pointermove", {
      x: 601,
      y: 151,
      button: 0,
      clientX: 601,
      clientY: 151,
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
