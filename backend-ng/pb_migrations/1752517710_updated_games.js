/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4121213662")

  // update collection data
  unmarshal({
    "listRule": "board.published = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4121213662")

  // update collection data
  unmarshal({
    "listRule": ""
  }, collection)

  return app.save(collection)
})
