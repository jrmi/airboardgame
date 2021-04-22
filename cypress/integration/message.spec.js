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
    cy.contains("0 Test game", { timeout: 10000 }).parent().find("img").click();
    // Way board loading
    cy.get(".board-pane", { timeout: 10000 }).should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
    );
  });

  it("Should show and hide message panel", () => {
    cy.contains("Send").should("not.exist");
    cy.get("img[alt^='Message']").click({ force: true });
    cy.contains("Send");
    cy.get(".side-panel.open [alt^='Close']").click();
    cy.contains("Send").should("not.exist");
  });

  it("Should send message", () => {
    cy.get("img[alt^='Message']").click({ force: true });

    cy.get("input[placeholder^='Enter your message...']").type(
      "What is the question?"
    );
    cy.contains("Send").click();

    cy.contains("What is the question?");
  });
});
