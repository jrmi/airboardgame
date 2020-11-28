describe("Board interactions", () => {
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

  it("Load game page", () => {
    cy.contains("Test game");
    cy.get("[title=Save]");
    cy.get("[title=Help]");
    cy.get("[title=Information]");
    cy.get("[title='Add an item']");
  });

  it("Pan board with middle click", () => {
    cy.get(".board")
      .trigger("pointerdown", {
        pointerId: 10,
        buttons: 4,
        clientX: 100,
        clientY: 100,
        isPrimary: true,
      })
      .trigger("pointermove", {
        pointerId: 10,
        buttons: 4,
        clientX: 200,
        clientY: 200,
        isPrimary: true,
        force: true,
      })
      .trigger("pointerup", {
        pointerId: 10,
        force: true,
        isPrimary: true,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 100, -100)"
    );
  });

  it("Pan board with left click and altKey ", () => {
    cy.get(".board")
      .trigger("pointerdown", {
        pointerId: 11,
        buttons: 1,
        clientX: 100,
        clientY: 100,
        isPrimary: true,
        altKey: true,
      })
      .trigger("pointermove", {
        pointerId: 11,
        buttons: 1,
        clientX: 200,
        clientY: 200,
        altKey: true,
        isPrimary: true,
        force: true,
      })
      .trigger("pointerup", {
        pointerId: 11,
        force: true,
        isPrimary: true,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 100, -100)"
    );
  });
});
