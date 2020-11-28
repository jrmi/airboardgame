describe("Selection action", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("Test Game").parent().find(".button").click();
    // Way board loading
    cy.get(".board-pane").should(
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

  it("should select multiple items with right click ", () => {
    cy.get(".board")
      .trigger("pointerdown", {
        pointerId: 42,
        x: 350,
        y: 500,
        clientX: 350,
        clientY: 500,
        buttons: 1,
        isPrimary: true,
      })
      .trigger("pointermove", {
        pointerId: 42,
        x: 600,
        y: 150,
        buttons: 1,
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
      pointerId: 42,
      x: 601,
      y: 151,
      buttons: 1,
      clientX: 601,
      clientY: 151,
      isPrimary: true,
      force: true,
    });

    cy.wait(500);

    cy.get(".board").trigger("pointerup", {
      pointerId: 42,
      isPrimary: true,
      force: true,
    });

    cy.get("img[src='/games/AS.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/games/BH.jpg']")
      .parents(".item")
      .should("have.class", "selected");
  });
});
