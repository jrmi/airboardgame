describe("Studio", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/auth/check",
      },
      // eslint-disable-next-line quotes
      '{"message":"success"}'
    );

    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/store/game*",
      },
      // eslint-disable-next-line quotes
      "[]"
    );

    cy.visit("/", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("isAuthenticated", "true");
      },
    });
    cy.contains("Studio").click();
  });

  it("Can see add game button", () => {
    cy.contains("Add a game");
  });

  it("Can access new game creation", () => {
    cy.get("[title^='Add a game']").click();
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -500, -700)"
    );
  });

  it("Can create empty game", () => {
    cy.get("[title^='Add a game']").click();
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -500, -700)"
    );

    // save
    cy.intercept(
      {
        method: "POST",
        url: "/airboardgame/store/game/*",
      },
      // eslint-disable-next-line quotes
      (req) => {
        expect(req.body.items.length).to.equal(0);
        req.reply(req.body);
      }
    );

    cy.get("[title^='Save']").click();
    cy.get("button").contains("Save").click();
  });

  it("Can create basic game", () => {
    cy.get("[title^='Add a game']").click();
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -500, -700)"
    );
    // Add an item
    cy.get("[title^='Add an item']").click();
    cy.contains("Rectangle").parent().parent().click();
    cy.get(".side-panel.open [alt^='Close']").click();

    // save
    cy.intercept(
      {
        method: "POST",
        url: "/airboardgame/store/game/*",
      },
      // eslint-disable-next-line quotes
      (req) => {
        expect(req.body.items.length).to.equal(1);
        expect(req.body.items[0].type).to.equal("rect");
        req.reply(req.body);
      }
    );

    cy.get("[title^='Save']").click();
    cy.get("button").contains("Save").click();
  });

  it("Can edit game properties", () => {
    cy.get("[title^='Add a game']").click();
    cy.get(".board-pane").should(
      "have.css",
      "transform",
      "matrix(1, 0, 0, 1, -500, -700)"
    );

    // Edit title
    cy.get("[title^='Edit game information']").click();
    cy.get('input[name="defaultName"]').clear().type("ChangeGameName");
    cy.get(".side-panel.open [alt^='Close']").click();

    cy.contains("ChangeGameName");

    cy.intercept(
      {
        method: "POST",
        url: "/airboardgame/store/game/*",
      },
      // eslint-disable-next-line quotes
      (req) => {
        expect(req.body.board.defaultName).to.equal("ChangeGameName");
        req.reply(req.body);
      }
    );

    cy.get("[title^='Save']").click();
    cy.get("button").contains("Save").click();
  });

  describe("Item edition", () => {
    beforeEach(() => {
      cy.get("[title^='Add a game']").click();
      cy.get(".board-pane").should(
        "have.css",
        "transform",
        "matrix(1, 0, 0, 1, -500, -700)"
      );
      // Add an item
      cy.get("[title^='Add an item']").click();
      cy.contains("Rectangle").parent().parent().click();
      cy.get(".side-panel.open [alt^='Close']").click();
    });

    it("Can update item properties", () => {
      cy.get(".item").click({ force: true });
      cy.get("button img[alt^='Edit']").click({ force: true });

      cy.get('input[name="width"]').clear().type("100");
      cy.get('input[name="height"]').clear().type("75");
      cy.get('input[name="text"]').clear().type("myCube");

      cy.get(".item")
        .children()
        .first()
        .should((elt) => {
          console.log(elt[0]);
          const { clientWidth, clientHeight } = elt[0];
          expect(clientWidth).to.equal(100);
          expect(clientHeight).to.equal(75);
        });

      cy.get(".item").contains("myCube");
    });

    it("Can lock an item", () => {
      cy.get(".item").click({ force: true });
      cy.get("button img[alt^='Edit']").click({ force: true });

      cy.get('input[name="locked"]').click();

      cy.get(".item").should("have.class", "locked");

      cy.contains("New").click();

      cy.get(".item").click({ force: true });

      cy.get(".item").should("not.have.class", "selected");

      cy.get(".item").dblclick({ force: true });

      cy.contains("Hint");
      cy.wait(1000);

      // long press to unlock
      cy.get(".item").trigger("pointerdown", { force: true });
      cy.wait(1100);
      cy.get(".item").trigger("pointerup", { force: true });

      cy.get(".item").should("have.class", "selected");
    });

    it("Can change item layer", () => {
      cy.get(".item").click({ force: true });
      cy.get("button img[alt^='Edit']").click({ force: true });

      cy.get(".item").parent().should("have.css", "z-index", "3");

      cy.get(".rc-slider-mark-text").contains("-1").click();

      cy.get(".item").parent().should("have.css", "z-index", "2");
    });
  });
});

/* TODO

- rotation
- layer
- actions
- Items

*/
