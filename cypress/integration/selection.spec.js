const { transform } = require("@babel/core");

describe("Selection action", () => {
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

  it("should select multiple items with left click ", () => {
    cy.get(".board")
      .trigger("mousedown", {
        x: 350,
        y: 500,
        clientX: 350,
        clientY: 500,
        button: 0,
      })
      .trigger("mousemove", {
        x: 600,
        y: 150,
        clientX: 600,
        clientY: 150,
        force: true,
      });

    cy.get(".selector").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, 350, 350)"
    );

    cy.get(".board").trigger("mousemove", {
      x: 601,
      y: 151,
      clientX: 601,
      clientY: 151,
      force: true,
    });

    cy.wait(500);

    cy.get(".board").trigger("mouseup", {
      force: true,
    });

    cy.get("img[src='/games/AS.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/games/JC.jpg']")
      .parents(".item")
      .should("have.class", "selected");
    cy.get("img[src='/games/BH.jpg']")
      .parents(".item")
      .should("have.class", "selected");
  });
});
