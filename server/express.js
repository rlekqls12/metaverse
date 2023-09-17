import express from "express";
import {
  PUBLISH_CLIENT_DIRECTORY,
  PUBLISH_SERVER_DIRECTORY,
  pipeFile,
} from "./file.js";
import { metaverseData } from "./data.js";
import { serverLog } from "./log.js";
import { isExistMap, saveMap } from "./map.js";

// create express server app
export function createServerApp() {
  const app = express();

  // ------------------------------------- default header setting
  app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.removeHeader("X-Powered-By");

    serverLog(`>>> API`, request.url);
    next();
  });

  // ------------------------------------- publish client index folder
  const staticClientIndexDirectory = express.static(
    PUBLISH_CLIENT_DIRECTORY + "/index"
  );
  app.use("/", staticClientIndexDirectory);

  // ------------------------------------- publish client map folder
  const staticClientMapDirectory = express.static(
    PUBLISH_CLIENT_DIRECTORY + "/map"
  );
  app.use("/map", staticClientMapDirectory);

  // ------------------------------------- load map (can joined user)
  app.get("/map/list/:mapId", function (request, response) {
    const ip =
      request.socket.address().address ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;
    const isJoinedUser = metaverseData.users.some((user) => user.ip === ip);
    if (isJoinedUser === false) {
      response.statusCode = 401;
      response.end();
      return;
    }

    const fileDirectory =
      PUBLISH_SERVER_DIRECTORY + `/map/${request.params.mapId}.json`;
    pipeFile(response, fileDirectory);
  });

  // ------------------------------------- save map
  app.post("/map/save", express.json(), function (request, response) {
    const ip =
      request.socket.address().address ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;
    const mapInfo = request.body.data;
    let mapId = "";

    console.log(request.body);

    try {
      mapId = mapInfo.id;

      serverLog(
        `>>> #[${ip}] Save Map Start`,
        mapId,
        JSON.stringify(mapInfo).length
      );

      const isMapObject =
        "id" in mapInfo &&
        "size" in mapInfo &&
        "start" in mapInfo &&
        "wall" in mapInfo;
      if (isMapObject === false) throw new Error("is not map data");
    } catch (error) {
      serverLog(`>>> #[${ip}] Save Map Is Failed >>> Is Not Map Data`, mapId);
      response.statusCode = 421; // 421 Misdirected Request
      response.send("is not map data");
      return;
    }

    if (isExistMap(mapId)) {
      serverLog(`>>> #[${ip}] Save Map Is Failed >>> Already Exist`, mapId);
      response.statusCode = 421; // 421 Misdirected Request
      response.send("already exist map name");
      return;
    }

    try {
      saveMap(mapId, JSON.stringify(mapInfo));
      response.statusCode = 200;
      response.end();
      serverLog(`>>> #[${ip}] Save Map Done`, mapId);
    } catch (error) {
      serverLog(
        `>>> #[${ip}] Save Map Is Failed >>> Server Error: ${error}`,
        mapId
      );
      response.statusCode = 503;
      response.send("server error");
    }
  });

  // ------------------------------------- 404
  app.use("*", function (request, response) {
    response.statusCode = 404;
    response.end();
  });

  return app;
}
