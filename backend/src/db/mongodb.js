import { MongoClient } from "mongodb";
import Datastore from "@seald-io/nedb";
import { SITE_PREFIX } from "../config.js";

let client;
let database;
const nedbStores = new Map();

const useNeDb = () =>
  (process.env.STORE_BACKEND || process.env.JSON_STORE_BACKEND || "mongodb") ===
  "nedb";

export const connectMongo = async () => {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGODB_DATABASE);
  return database;
};

export const closeMongo = async () => {
  await client?.close();
  client = undefined;
  database = undefined;
};

export const collectionName = (box) =>
  process.env[`MONGODB_COLLECTION_${box.toUpperCase()}`] ||
  `_${SITE_PREFIX}__${box}`;

const loadNeDb = (filename) =>
  new Promise((resolve, reject) => {
    const store = new Datastore({ filename, autoload: false });
    store.loadDatabase((error) => (error ? reject(error) : resolve(store)));
  });

const getNeDb = async (box) => {
  const filename = `${process.env.NEDB_BACKEND_DIRNAME || process.env.NEDB_DIRNAME || "/tmp"}/${collectionName(box)}.json`;
  if (!nedbStores.has(filename)) nedbStores.set(filename, loadNeDb(filename));
  return nedbStores.get(filename);
};

const cursor = (store, query) => {
  const options = {};
  return {
    sort(value) {
      options.sort = value;
      return this;
    },
    skip(value) {
      options.skip = value;
      return this;
    },
    limit(value) {
      options.limit = value;
      return this;
    },
    toArray() {
      return new Promise((resolve, reject) => {
        let result = store.find(query);
        if (options.sort) result = result.sort(options.sort);
        if (options.skip !== undefined) result = result.skip(options.skip);
        if (options.limit !== undefined) result = result.limit(options.limit);
        result.exec((error, documents) =>
          error ? reject(error) : resolve(documents)
        );
      });
    },
  };
};

const nedbCollection = async (box) => {
  const store = await getNeDb(box);
  return {
    find: (query) => cursor(store, query),
    findOne: (query) =>
      new Promise((resolve, reject) =>
        store.findOne(query, (error, result) =>
          error ? reject(error) : resolve(result)
        )
      ),
    insertOne: (document) =>
      new Promise((resolve, reject) =>
        store.insert(document, (error, result) =>
          error ? reject(error) : resolve({ insertedId: result._id })
        )
      ),
    replaceOne: (query, document, { upsert = false } = {}) =>
      new Promise((resolve, reject) =>
        store.update(
          query,
          document,
          { multi: false, upsert },
          (error, count) =>
            error
              ? reject(error)
              : resolve({ modifiedCount: count, deletedCount: count })
        )
      ),
    deleteOne: (query) =>
      new Promise((resolve, reject) =>
        store.remove(query, { multi: false }, (error, count) =>
          error ? reject(error) : resolve({ deletedCount: count })
        )
      ),
    deleteMany: (query) =>
      new Promise((resolve, reject) =>
        store.remove(query, { multi: true }, (error, count) =>
          error ? reject(error) : resolve({ deletedCount: count })
        )
      ),
  };
};

export const getCollection = async (box) =>
  useNeDb()
    ? nedbCollection(box)
    : (await connectMongo()).collection(collectionName(box));
