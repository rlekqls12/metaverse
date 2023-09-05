import fs from "fs";
import path from "path";
import mimeTypes from "mime-types";

export const BASE_DIRECTORY = path.resolve();
export const PUBLISH_CLIENT_DIRECTORY = BASE_DIRECTORY + "/client";
export const PUBLISH_SERVER_DIRECTORY = BASE_DIRECTORY + "/server";

// file pass
export function pipeFile(response, fileDirectory) {
  const isExistFile = fs.existsSync(fileDirectory);
  if (isExistFile === false) {
    response.statusCode = 404;
    response.end();
    return;
  }

  const mimeType = mimeTypes.lookup(fileDirectory);
  const contentType = mimeTypes.contentType(mimeType);
  response.setHeader("Content-Type", contentType);

  const buffer = fs.readFileSync(fileDirectory);
  response.setHeader("Content-Length", buffer.byteLength);
  response.write(buffer);
  response.end();
}
