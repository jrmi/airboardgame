describe("Board interactions", () => {
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
      "matrix(0.48, 0, 0, 0.48, -11693.9, -11917.9)"
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
      "matrix(0.48, 0, 0, 0.48, -11593.9, -11817.9)"
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
      "matrix(0.48, 0, 0, 0.48, -11593.9, -11817.9)"
    );
  });

  it("Pan board with left click when is main action", () => {
    cy.get("[title^='Switch to move mode']").click({
      scrollBehavior: false,
    });

    cy.get(".board")
      .trigger("pointerdown", {
        button: 0,
        x: 150,
        y: 200,
        clientX: 150,
        clientY: 200,
        pointerId: 1,
        force: true,
        scrollBehavior: false,
      })
      .trigger("pointermove", {
        button: 0,
        x: 400,
        y: 400,
        clientX: 400,
        clientY: 400,
        pointerId: 1,
        force: true,
        scrollBehavior: false,
      })
      .trigger("pointerup", {
        force: true,
        pointerId: 1,
        isPrimary: true,
        scrollBehavior: false,
      });
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(0.48, 0, 0, 0.48, -11443.9, -11717.9)"
    );
  });
});

/* TODO

- Change main navigation
- show/Hide menu

*/
