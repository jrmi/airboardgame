describe("Generator lifecycle", () => {
  beforeEach(() => {
    cy.viewport(1000, 600);
    cy.intercept(
      {
        method: "GET",
        url: "/airboardgame/store/game*",
      },
      []
    );
    cy.visit("/");
    cy.contains("0 Test game", { timeout: 10000 })
      .parent()
      .find(".img-wrapper")
      .click();
    cy.get(".board-pane", { timeout: 10000 }).should("be.visible");
  });

  it("keeps the grid-snapped initial child linked to its generator", () => {
    cy.get("[data-generator-id]", { timeout: 10000 })
      .should("have.length", 1)
      .invoke("attr", "data-current-item-id")
      .should("not.be.empty")
      .then((initialChildId) => {
        cy.get(`[data-id="${initialChildId}"]`).should(($child) => {
          const childRect = $child[0].getBoundingClientRect();
          const generatorRect = Cypress.$(
            "[data-generator-id]"
          )[0].getBoundingClientRect();

          expect(childRect.left + childRect.width / 2).to.be.closeTo(
            generatorRect.left + generatorRect.width / 2,
            2
          );
          expect(childRect.top + childRect.height / 2).to.be.closeTo(
            generatorRect.top + generatorRect.height / 2,
            2
          );
        });

        cy.get(".item").then(($items) => {
          const initialItemCount = $items.length;

          // The generated jewel uses a 100px grid. Its automatic snap emits
          // a delayed `place`, which must not be treated as a user move.
          cy.wait(1200);
          cy.get("[data-generator-id]").should(
            "have.attr",
            "data-current-item-id",
            initialChildId
          );
          cy.get(`[data-id="${initialChildId}"]`).should("exist");
          cy.get(".item").should("have.length", initialItemCount);

          cy.get("[data-generator-id]").then(($generator) => {
            cy.get(`[data-id="${initialChildId}"]`).then(($child) => {
              const generatorRect = $generator[0].getBoundingClientRect();
              const childRect = $child[0].getBoundingClientRect();
              const generatorCenterX =
                generatorRect.left + generatorRect.width / 2;
              const generatorCenterY =
                generatorRect.top + generatorRect.height / 2;
              const childCenterX = childRect.left + childRect.width / 2;
              const childCenterY = childRect.top + childRect.height / 2;

              expect(childCenterX).to.be.closeTo(generatorCenterX, 2);
              expect(childCenterY).to.be.closeTo(generatorCenterY, 2);
            });
          });
        });
      });
  });

  it("replaces a grid-snapped child once after it leaves", () => {
    cy.get("[data-generator-id]", { timeout: 10000 })
      .should("have.length", 1)
      .invoke("attr", "data-current-item-id")
      .should("not.be.empty")
      .then((initialChildId) => {
        cy.get(`[data-id="${initialChildId}"]`).should(($child) => {
          const childRect = $child[0].getBoundingClientRect();
          const generatorRect = Cypress.$(
            "[data-generator-id]"
          )[0].getBoundingClientRect();

          expect(childRect.left + childRect.width / 2).to.be.closeTo(
            generatorRect.left + generatorRect.width / 2,
            2
          );
          expect(childRect.top + childRect.height / 2).to.be.closeTo(
            generatorRect.top + generatorRect.height / 2,
            2
          );
        });

        cy.get(".item").then(($items) => {
          const initialItemCount = $items.length;

          cy.get(`[data-id="${initialChildId}"]`).then(($child) => {
            const rect = $child[0].getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            cy.wrap($child)
              .trigger("pointerdown", {
                buttons: 1,
                clientX: startX,
                clientY: startY,
                pointerId: 1,
                force: true,
              })
              .trigger("pointermove", {
                buttons: 1,
                clientX: startX + 200,
                clientY: startY,
                pointerId: 1,
                force: true,
              })
              .trigger("pointerup", {
                clientX: startX + 200,
                clientY: startY,
                pointerId: 1,
                force: true,
              });
          });

          cy.get("[data-generator-id]")
            .invoke("attr", "data-current-item-id")
            .should("not.be.empty")
            .and("not.equal", initialChildId)
            .then((replacementId) => {
              cy.get(`[data-id="${initialChildId}"]`).should("exist");
              cy.get(`[data-id="${replacementId}"]`).should("exist");
            });

          cy.get(".item").should("have.length", initialItemCount + 1);
          cy.wait(500);
          cy.get(".item").should("have.length", initialItemCount + 1);
        });
      });
  });
});
