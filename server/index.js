import fs from "fs";
import path from "path";
import mimeTypes from "mime-types";
import express from "express";

const BASE_DIRECTORY = path.resolve();
const PUBLISH_CLIENT_DIRECTORY = BASE_DIRECTORY + "/client";
const PUBLISH_SERVER_DIRECTORY = BASE_DIRECTORY + "/server";

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

// server start
app.listen(80, function () {
  console.log(">>> Server Running 80 Port");
  console.log(">>> Publish", PUBLISH_CLIENT_DIRECTORY);
});

// file pass
function pipeFile(response, fileDirectory) {
  const mimeType = mimeTypes.lookup(fileDirectory);
  const contentType = mimeTypes.contentType(mimeType);
  response.setHeader("Content-Type", contentType);

  const buffer = fs.readFileSync(fileDirectory);
  response.setHeader("Content-Length", buffer.byteLength);
  response.write(buffer);
  response.end();
}
