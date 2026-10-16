describe("Held item rotation", () => {
  const holder = ".item[data-id='rotation-holder']";
  const child = ".item[data-id='rotation-child']";
  const rotate = () =>
    cy.get("[title^='Rotate 90']", { timeout: 10000 }).click({ force: true });

  const expectRotation = (selector, expectedRotation) => {
    cy.get(selector).should(($item) => {
      const rotation = $item.css("transform");
      const rotationValues = rotation.match(/-?\d+(?:\.\d+)?/g).map(Number);
      expect(rotationValues[0]).to.be.closeTo(
        Math.cos((expectedRotation * Math.PI) / 180),
        0.001
      );
      expect(rotationValues[1]).to.be.closeTo(
        Math.sin((expectedRotation * Math.PI) / 180),
        0.001
      );
    });
  };

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
    cy.get(".board-pane", { timeout: 10000 }).should("be.visible");
    cy.get(holder).should("exist");
    cy.get(child).should("exist");
  });

  it("rotates a held child when only its holder is selected", () => {
    cy.get(holder).click({ force: true });
    rotate();

    expectRotation(holder, 100);
    expectRotation(child, 130);
    cy.get(child)
      .parent()
      .should("not.have.css", "transform", "matrix(1, 0, 0, 1, 130, 380)");
  });

  it("ignores a held child as a separate root when both are selected", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get(holder).should("have.class", "selected");
    cy.get(child).should("have.class", "selected");

    rotate();

    expectRotation(holder, 100);
    expectRotation(child, 130);
    cy.get(child)
      .parent()
      .should("not.have.css", "transform", "matrix(1, 0, 0, 1, 130, 380)");
  });

  it("uses a relative custom rotation in the editor when both are selected", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get("[title='Edit']").click({ force: true });
    cy.get(".slider-rotation").should("not.exist");
    cy.get("[aria-label='Custom rotation amount']").should("have.value", "90");
    cy.get(".rotation-custom-buttons").contains("button", "+").click();

    expectRotation(holder, 100);
    expectRotation(child, 130);
    cy.get(child)
      .parent()
      .should("not.have.css", "transform", "matrix(1, 0, 0, 1, 130, 380)");
  });

  it("applies only the clicked quick rotation button", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get("[title='Edit']").click({ force: true });

    cy.get(".rotation-delta-controls > button").then(($buttons) => {
      const margins = [...$buttons].map(
        (button) => getComputedStyle(button).marginLeft
      );
      expect(new Set(margins)).to.have.property("size", 1);
    });
    cy.get(".rotation-delta-controls > button[title='Rotate -5°']").click();

    expectRotation(holder, 5);
    expectRotation(child, 35);
  });

  it("resets every selected angle to zero", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get("[title='Edit']").click({ force: true });

    cy.get("[title='Reset rotation to 0°']").click();

    expectRotation(holder, 0);
    expectRotation(child, 0);
  });

  it("preserves different action lists while rotating a multi-selection", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get("[title='Edit']").click({ force: true });
    cy.contains("Some items have different action configurations.").should(
      "be.visible"
    );
    cy.contains("button", "Combine actions and edit them together").should(
      "be.visible"
    );

    cy.get(".rotation-delta-controls > button[title='Rotate 1°']").click();
    cy.get(".board").click(900, 100, { force: true });
    cy.get(holder).click({ force: true });
    cy.get("[title^='Reveal/Hide']").should("exist");

    cy.get(".board").click(900, 100, { force: true });
    cy.get(child).click({ force: true });
    cy.get("[title^='Tap/Untap']").should("exist");
  });

  it("combines different action lists before editing them together", () => {
    cy.get(holder).click({ force: true });
    cy.get(child).click({ ctrlKey: true, force: true });
    cy.get("[title='Edit']").click({ force: true });

    cy.contains("button", "Combine actions and edit them together").click();
    cy.contains("Some items have different action configurations.").should(
      "not.exist"
    );

    cy.get(".board").click(900, 100, { force: true });
    cy.get(holder).click({ force: true });
    cy.get("[title^='Tap/Untap']").should("exist");
    cy.get("[title^='Reveal/Hide']").should("exist");
    cy.get("[title^='Rotate 90']").should("exist");

    cy.get(".board").click(900, 100, { force: true });
    cy.get(child).click({ force: true });
    cy.get("[title^='Tap/Untap']").should("exist");
    cy.get("[title^='Reveal/Hide']").should("exist");
    cy.get("[title^='Rotate 90']").should("exist");
  });

  it("rotates once when the child is selected before its holder", () => {
    cy.get(child).click({ force: true });
    cy.get(holder).click({ ctrlKey: true, force: true });
    cy.get(child).should("have.class", "selected");
    cy.get(holder).should("have.class", "selected");
    cy.get("[title='Edit']").click({ force: true });

    cy.get(".rotation-delta-controls > button[title='Rotate 1°']").click();

    expectRotation(holder, 11);
    expectRotation(child, 41);
    cy.get(".item:not([data-id])").should("not.exist");
    cy.get(".item[data-id='undefined']").should("not.exist");
  });

  it("keeps item identities and positions when selection expands while editing", () => {
    cy.get(child).click({ force: true });
    cy.get("[title='Edit']").click({ force: true });
    cy.get(".slider-rotation").should("be.visible");

    cy.get(holder).click({ ctrlKey: true, force: true });
    cy.get(child).should("have.class", "selected");
    cy.get(holder).should("have.class", "selected");
    cy.wait(300);

    cy.get(child).should("have.attr", "data-id", "rotation-child");
    cy.get(holder).should("have.attr", "data-id", "rotation-holder");
    cy.get(child)
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 130, 380)");
    cy.get(holder)
      .parent()
      .should("have.css", "transform", "matrix(1, 0, 0, 1, 50, 350)");
    cy.get(".item:not([data-id])").should("not.exist");
    cy.get(".item[data-id='undefined']").should("not.exist");
  });
});
