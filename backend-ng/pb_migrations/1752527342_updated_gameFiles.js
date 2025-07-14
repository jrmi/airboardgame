/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_368023026")

  // update collection data
  unmarshal({
    "createRule": "game.owner.id = @request.auth.id",
    "deleteRule": "game.owner.id = @request.auth.id",
    "listRule": "",
    "updateRule": "game.owner.id = @request.auth.id",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_368023026")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
