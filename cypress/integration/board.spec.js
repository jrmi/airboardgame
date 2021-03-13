describe("Board interactions", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("0 Test game").parent().find("img").click();
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
    cy.contains("0 Test game");
    cy.get("[alt=Save]");
    cy.get("[alt='Help & info']");
    cy.get("[title='Add an item']");
  });

  it("Pan board with middle click", () => {
    cy.get(".board")
      .trigger("pointerdown", {
        button: 1,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      })
      .trigger("pointermove", {
        clientX: 200,
        clientY: 200,
        pointerId: 1,
        force: true,
      })
      .trigger("pointerup", {
        force: true,
        pointerId: 1,
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
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        altKey: true,
      })
      .trigger("pointermove", {
        button: 0,
        clientX: 200,
        clientY: 200,
        pointerId: 1,
        altKey: true,
        force: true,
      })
      .trigger("pointerup", {
        force: true,
        pointerId: 1,
        isPrimary: true,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 100, -100)"
    );
  });
});
