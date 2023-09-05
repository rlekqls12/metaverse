import express from "express";
import {
  PUBLISH_CLIENT_DIRECTORY,
  PUBLISH_SERVER_DIRECTORY,
  pipeFile,
} from "./file.js";

// server start
export function createServer() {
  const app = express();

  // default header setting
  app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.removeHeader("X-Powered-By");
    next();
  });

  // publish client folder
  app.use(express.static(PUBLISH_CLIENT_DIRECTORY));

  // TODO: temp map
  app.get("/server/map/init.json", function (request, response) {
    const fileDirectory = PUBLISH_SERVER_DIRECTORY + "/map/init.json";
    pipeFile(response, fileDirectory);
  });

  // 404
  app.use("*", function (request, response) {
    response.statusCode = 404;
    response.end();
  });

  return app;
}
