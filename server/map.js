import fs from "fs";
import { PUBLISH_SERVER_DIRECTORY } from "./file.js";

export function getMap(name) {
  const readFile = fs.readFileSync(
    PUBLISH_SERVER_DIRECTORY + `/map/${name}.json`
  );
  return JSON.parse(readFile);
}
