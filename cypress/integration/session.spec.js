describe("Item interactions", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/store/game*",
      },
      // eslint-disable-next-line quotes
      "[]"
    );
    cy.clock();
    cy.visit("/");
    cy.contains("0 Test game", { timeout: 10000 }).parent().find("img").click();

    cy.tick(10000);
    // Way board loading
    cy.get(".board-pane", { timeout: 10000 }).should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 0, -200)"
    );
    cy.get(".item")
      .first()
      .children()
      .first()
      .should("have.css", "transform", "none");

    // Wait grace time of autosave
    cy.tick(10000);
  });

  afterEach(() => {
    // restore the clock
    cy.clock().then((clock) => {
      clock.restore();
    });
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

    cy.intercept(
      {
        method: "POST",
        url: "/airboardgame/store/session/*",
      },
      // eslint-disable-next-line quotes
      (req) => {
        expect(req.body).to.have.property("items");
        req.reply(req.body);
      }
    ).as("postSession");

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

    // advance to autosave time
    cy.tick(10000);

    cy.wait("@postSession");
  });
});
