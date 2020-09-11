import express from "express";
import http from "http";
import vm from "vm";

const errorGuard = (func) => async (req, res, next) => {
  try {
    return await func(req, res, next);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const SCRIPT_URL = `http://localhost:3000/exec`;

// Store Middleware
export const exec = ({ prefix = "/execution", context = {} } = {}) => {
  const cache = {};

  const cacheOrFetch = async (functionName, extraCommands = "") => {
    if (cache[functionName]) {
      return cache[functionName];
    } else {
      return new Promise((resolve, reject) => {
        const filename = `${SCRIPT_URL}/${functionName}.js`;
        http
          .get(filename, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
              data += chunk;
            });
            resp.on("end", () => {
              data += extraCommands;
              const script = new vm.Script(data, { filename });
              cache[functionName] = script;
              resolve(script);
            });
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    }
  };

  let config = {};

  // Load config
  cacheOrFetch("setup", "\nmain();").then((toRun) => {
    config = toRun.runInNewContext();
  });

  const router = express.Router();
  // One object
  router.get(
    `${prefix}/:functionName/`,
    errorGuard(async (req, res) => {
      const {
        body,
        params: { functionName },
        query,
      } = req;
      const toRun = await cacheOrFetch(functionName, "\nmain();");
      const fullContext = {
        console,
        query,
        body,
        ...context,
        ...config,
      };
      const result = await toRun.runInNewContext(fullContext);
      res.send("" + result);
    })
  );

  return router;
};

export default exec;
