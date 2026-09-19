describe("Messages interactions", () => {
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
    cy.contains("0 Test game", { timeout: 10000 })
      .parent()
      .find(".img-wrapper")
      .click();
    // Way board loading
    cy.get(".board-pane", { timeout: 10000 })
      .should("be.visible")
      .should("have.css", "transform")
      .and("match", /^matrix\(/);
  });

  it("Should show and hide message panel", () => {
    cy.contains("Send").should("not.exist");
    cy.get("[title^='Message']").click({ force: true });
    cy.contains("Send");
    cy.wait(400);
    cy.get(".side-panel__close").click({ force: true });
    cy.contains("Send").should("not.exist");
  });

  it("Should send message", () => {
    cy.get("[title^='Message']").click({ force: true });

    cy.get("input[placeholder^='Enter your message...']").type(
      "What is the question?"
    );
    cy.contains("Send").click();

    cy.contains("What is the question?");
  });
});
