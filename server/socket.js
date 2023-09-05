import { WebSocketServer } from "ws";
import { metaverseData } from "./data.js";
import { getMap } from "./map.js";

export function createWebSocketServer(option) {
  return new WebSocketServer(option);
}

export function joinWebSocketServer(ip, data) {
  const id = data.id;

  let joinedUser = metaverseData.users.find((user) => user.id === id);
  const isAlreadyJoin = Boolean(joinedUser);

  if (isAlreadyJoin) {
    const now = new Date();
    if (joinedUser.ip !== ip && now - joinedUser.lastConnection <= 3000) {
      throw new Error("already join user");
    }
  } else {
    // create user
    metaverseData.users.push({
      ip: ip,
      id: id,
      map: "init",
      position: [],
      speed: 0.1,
      lastConnection: new Date(),
    });
  }

  // find user
  joinedUser = metaverseData.users.find((user) => user.id === id);

  // get map
  const map = getMap(joinedUser.map);

  // set start position
  if (joinedUser.position.length === 0) {
    const randomStartIndex = Math.floor(Math.random() * map.start.length);
    joinedUser.position = [].concat(map.start[randomStartIndex]);
  }

  return joinedUser;
}

export function updateWebSocketUser(ip, id) {
  const joinedUser = metaverseData.users.find(
    (user) => user.ip === ip && user.id === id
  );
  joinedUser.lastConnection = new Date();
}
