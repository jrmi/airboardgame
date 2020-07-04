describe("Selection action", () => {
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

  it("should select multiple items with left click ", () => {
    cy.get(".board")
      .trigger("mousedown", {
        x: 600,
        y: 400,
        clientX: 600,
        clientY: 400,
        button: 0,
      })
      .trigger("mousemove", {
        x: 200,
        y: 100,
        clientX: 200,
        clientY: 100,
        force: true,
      })
      .trigger("mouseup", {
        force: true,
      });

    cy.get("img[src='/games/BH.jpg']")
      .parents(".item")
      .should("have.css", "border", "2px dashed rgba(255, 0, 0, 0.627)");
    cy.get("img[src='/games/AS.jpg']")
      .parents(".item")
      .should("have.css", "border", "2px dashed rgba(255, 0, 0, 0.627)");
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should("have.css", "border", "2px dashed rgba(255, 0, 0, 0.627)");
  });
});
