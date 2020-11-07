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
      .trigger("mousedown", { button: 1 })
      .trigger("mousemove", {
        clientX: 200,
        clientY: 250,
        force: true,
      })
      .trigger("mouseup", {
        force: true,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -300, -250)"
    );
  });

  it("Pan board with left click and altKey ", () => {
    cy.get(".board")
      .trigger("mousedown", { button: 0, altKey: true })
      .trigger("mousemove", {
        clientX: 100,
        clientY: 150,
        force: true,
      })
      .trigger("mouseup", {
        force: true,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -400, -350)"
    );
  });
});
