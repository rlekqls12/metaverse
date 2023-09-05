import express from "express";
import {
  PUBLISH_CLIENT_DIRECTORY,
  PUBLISH_SERVER_DIRECTORY,
  pipeFile,
} from "./file.js";
import { metaverseData } from "./data.js";

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
  const staticClientDirectory = express.static(PUBLISH_CLIENT_DIRECTORY);
  app.use(staticClientDirectory);

  // load map (can joined user)
  app.get("/server/map/:mapId", function (request, response) {
    const ip = request.socket.address().address;
    const isJoinedUser = metaverseData.users.some((user) => user.ip === ip);

    if (isJoinedUser === false) {
      response.statusCode = 404;
      response.end();
      return;
    }

    const fileDirectory =
      PUBLISH_SERVER_DIRECTORY + `/map/${request.params.mapId}.json`;
    pipeFile(response, fileDirectory);
  });

  // 404
  app.use("*", function (request, response) {
    response.statusCode = 404;
    response.end();
  });

  return app;
}
