import express from "express";
import {
  PUBLISH_CLIENT_DIRECTORY,
  PUBLISH_SERVER_DIRECTORY,
  pipeFile,
} from "./file.js";
import { metaverseData } from "./data.js";

// create express server app
export function createServerApp() {
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
  app.get("/map/:mapId", async function (request, response) {
    // wait 0.25 seconds
    await new Promise((resolve) => setTimeout(resolve, 250));

    const ip = request.socket.remoteAddress;
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
