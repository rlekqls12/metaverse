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
    const now = new Date().getTime();
    if (
      id === "SERVER" ||
      (joinedUser.ip !== "" && now - joinedUser.lastConnection <= 1500)
    ) {
      throw new Error("already join user");
    }

    joinedUser.ip = ip;
    joinedUser.lastConnection = new Date().getTime();
  } else {
    // create user
    metaverseData.users.push({
      ip: ip,
      id: id,
      map: "init",
      position: [],
      speed: 0.1,
      lastConnection: new Date().getTime(),
    });
  }

  return initPosition(ip, id);
}

export function initPosition(ip, id) {
  // find user
  let joinedUser = metaverseData.users.find(
    (user) => user.ip === ip && user.id === id
  );

  // get map
  const map = getMap(joinedUser.map);

  // set start position
  if (joinedUser.position.length === 0) {
    const randomStartIndex = Math.floor(Math.random() * map.start.length);
    joinedUser.position = [].concat(map.start[randomStartIndex]);
  }

  return joinedUser;
}

export function updateWebSocketUserTime(ip, id) {
  const joinedUser = metaverseData.users.find(
    (user) => user.ip === ip && user.id === id
  );
  joinedUser.lastConnection = new Date().getTime();
}

export function updateWebSocketUser(ip, id, position) {
  const joinedUser = metaverseData.users.find(
    (user) => user.ip === ip && user.id === id
  );
  joinedUser.position = position;
}

export function sendChatEveryone(clients, chat) {
  // send chat log
  clients.forEach(function (socket) {
    sendChat(socket, chat);
  });
}

export function sendChat(socket, chat) {
  // send chat log
  socket.send(
    JSON.stringify({
      type: "SOCKET_SEND_TYPE_CHAT_LOG",
      data: chat,
    })
  );
}
