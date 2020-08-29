describe("Item interactions", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.visit("/");
    cy.contains("I want to play...", { timeout: 5000 }).click();
    cy.contains("Menu").click();
    cy.contains("Test game").click();

    // Way board loading
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
    );
  });

  it("should move item", () => {
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 420, 400)");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .trigger("mousedown", {
        button: 0,
        force: true,
      })
      .trigger("mousemove", {
        clientX: 200,
        clientY: 200,
        force: true,
      })
      .trigger("mouseup", {
        force: true,
      });
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 146, 320)");
  });

  it("should flip item", () => {
    // Check before
    cy.get("img[src='/games/JC.jpg']")
      .siblings("img[src='/games/Red_back.jpg']")
      .should("have.css", "opacity", "0");
    cy.get("img[src='/games/JC.jpg']").should("have.css", "opacity", "1");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Reveal/Hide"]').click();

    // Check after
    cy.get("img[src='/games/JC.jpg']").should("have.css", "opacity", "0");
    cy.get("img[src='/games/JC.jpg']")
      .siblings("img[src='/games/Red_back.jpg']")
      .should("have.css", "opacity", "1");
  });

  it("should tap item", () => {
    // Check before
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 0, 0)");

    // Select card
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Tap/Untap"]').click();

    // Check after
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should(
        "have.css",
        "transform",
        "matrix(6.12323e-17, 1, -1, 6.12323e-17, 0, 0)"
      );
  });
});
