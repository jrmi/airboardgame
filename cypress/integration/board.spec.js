describe("Board interactions", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("Menu").click();
    cy.contains("Test game").click();
    // Way board loading
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
    );

    // Wait for actual size to be defined
    cy.get("img[src='/games/JC.jpg']").parents(".item.loaded");
  });

  it("Load home page", () => {
    cy.contains("Menu");
    cy.contains("Help");
    cy.contains("AirBoard");
    cy.contains("Edit mode");
    cy.get("input").should("have.value", "Player");
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
