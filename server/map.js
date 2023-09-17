import fs from "fs";
import { PUBLISH_SERVER_DIRECTORY } from "./file.js";

function mapDirection(name) {
  return PUBLISH_SERVER_DIRECTORY + `/map/${name}.json`;
}

export function isExistMap(name) {
  const isExistFile = fs.existsSync(mapDirection(name));
  return isExistFile;
}

export function getMap(name) {
  const readFile = fs.readFileSync(mapDirection(name));
  return JSON.parse(readFile);
}

export function saveMap(name, data) {
  fs.writeFileSync(mapDirection(name), data, { encoding: "utf8" });
}
