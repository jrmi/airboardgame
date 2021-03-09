describe("Item interactions", () => {
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

  it("should move item", () => {
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 420, 400)");

    // Select card
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .trigger("pointerdown", {
        button: 0,
        clientX: 430,
        clientY: 430,
        force: true,
        pointerId: 1,
      });

    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .trigger("pointermove", {
        button: 0,
        clientX: 530,
        clientY: 530,
        force: true,
        pointerId: 1,
      })
      .trigger("pointerup", {
        force: true,
        pointerId: 1,
      });
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 520, 500.5)");
  });

  it("should flip item", () => {
    // Check before
    cy.get("img[src='/game_assets/JC.jpg']")
      .siblings("img[src='/game_assets/Red_back.jpg']")
      .should("have.css", "opacity", "0");
    cy.get("img[src='/game_assets/JC.jpg']").should("have.css", "opacity", "1");

    // Select card
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Reveal/Hide"]').click({ force: true });

    // Check after
    cy.get("img[src='/game_assets/JC.jpg']").should("have.css", "opacity", "0");
    cy.get("img[src='/game_assets/JC.jpg']")
      .siblings("img[src='/game_assets/Red_back.jpg']")
      .should("have.css", "opacity", "1");
  });

  it("should tap item", () => {
    // Check before
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 0, 0)");

    // Select card
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .click(500, 500, { force: true });

    cy.get('[title = "Tap/Untap"]').click({ force: true });

    // Check after
    cy.get("img[src='/game_assets/JC.jpg']")
      .parents(".item")
      .should(
        "have.css",
        "transform",
        "matrix(6.12323e-17, 1, -1, 6.12323e-17, 0, 0)"
      );
  });
});
