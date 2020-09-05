import express from "express";
import { memoryBackend } from "./storeBackends.js";

// Utility functions

// ROADMAP
// - Add bulk operations with atomicity
// - Handle more permissions types (Read, Delete, …)
// - Allow to send encrypted code block
// - Add Queries
// - Add relationship
// - Add http2 relationship ?

const throwError = (message, code = 400) => {
  const errorObject = new Error(message);
  errorObject.statusCode = code;
  throw errorObject;
};

const errorGuard = (func) => async (req, res, next) => {
  try {
    return await func(req, res, next);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Store Middleware
export const store = ({ prefix = "/store", backend = memoryBackend() }) => {
  const router = express.Router();

  // Resource list
  router.get(
    `${prefix}/:boxId/`,
    errorGuard(async (req, res) => {
      const { boxId } = req.params;
      const {
        limit = "50",
        sort = "_createdOn",
        skip = "0",
        q,
        fields,
      } = req.query;

      const onlyFields = fields ? fields.split(",") : [];

      const parsedLimit = parseInt(limit, 10);
      const parsedSkip = parseInt(skip, 10);

      let sortProperty = sort;
      let asc = true;

      // If prefixed with '-' inverse order
      if (sort[0] === "-") {
        sortProperty = sort.substring(1);
        asc = false;
      }

      const result = await backend.list(boxId, {
        sort: sortProperty,
        asc,
        limit: parsedLimit,
        skip: parsedSkip,
        onlyFields: onlyFields,
        q,
      });
      res.json(result);
    })
  );

  // One object
  router.get(
    `${prefix}/:boxId/:id`,
    errorGuard(async (req, res) => {
      const { boxId, id } = req.params;
      const result = await backend.get(boxId, id);
      if (!result) {
        throwError("Box or ressource not found", 404);
      }
      res.json(result);
    })
  );

  // Create object
  router.post(
    `${prefix}/:boxId/`,
    errorGuard(async (req, res) => {
      //console.log(req.body);
      const { boxId } = req.params;
      /*const { key } = req.query;
      if (!backend.checkSecurity(boxId, null, key)) {
        throwError("You need write access for this box", 403);
      }*/
      const result = await backend.create(boxId, req.body);
      return res.json(result);
    })
  );

  // Update object
  router.put(
    `${prefix}/:boxId/:id`,
    errorGuard(async (req, res) => {
      const { boxId, id } = req.params;
      const { key } = req.query;
      if (!(await backend.checkSecurity(boxId, id, key))) {
        throwError("You need write access for this ressource", 403);
      }
      const result = await backend.update(boxId, id, req.body);
      return res.json(result);
    })
  );

  // Delete object
  router.delete(
    `${prefix}/:boxId/:id`,
    errorGuard(async (req, res) => {
      const { boxId, id } = req.params;
      const { key } = req.query;
      if (!(await backend.checkSecurity(boxId, id, key))) {
        throwError("You need write access for this ressource", 403);
      }
      const result = await backend.delete(boxId, id);
      if (result === 1) {
        res.json({ message: "Deleted" });
      }
      throwError("Box or ressource not found", 404);
    })
  );

  // Middleware to handle errors
  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, _next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message });
  });

  return router;
};

export default store;
