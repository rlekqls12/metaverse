import { metaverseData } from "./data.js";
import { createServerApp } from "./express.js";
import { PUBLISH_CLIENT_DIRECTORY } from "./file.js";
import { serverLog } from "./log.js";
import {
  createWebSocketServer,
  joinWebSocketServer,
  updateWebSocketUserTime,
  updateWebSocketUser,
  sendChat,
  sendChatEveryone,
  initPosition,
} from "./socket.js";

const port = 3000;

// ---------------------------------------------------------------------- [ SERVER ]
const app = createServerApp();
const server = app.listen(port, function () {
  serverLog(`>>> Server Running ${port} Port`);
  serverLog(`>>> Publish`, PUBLISH_CLIENT_DIRECTORY);
});

// ---------------------------------------------------------------------- [ WEB SOCKET ]
const webSocketServer = createWebSocketServer({ server });
webSocketServer.on("connection", function (webSocket, request) {
  // ------------------------------ [ CONNECT SERVER ]
  const ip =
    request.socket.address().address ||
    request.headers["x-forwarded-for"] ||
    request.socket.remoteAddress;
  let id = "",
    joinedUser = {
      ip: "",
      id: "",
      map: "",
      position: [0, 0],
      speed: 0,
      lastConnection: 0,
    },
    isConnected = false;

  serverLog(`>>> #[${ip}] Join Client`);

  // ------------------------------ [ RECEIVE MESSAGE ]
  webSocket.on("message", function (message) {
    const data = JSON.parse(message.toString());
    // TODO: FOR DEVELOP
    // serverLog(`>>> #[${ip}] SOCKET MESSAGE`, data);

    // ---------- [ JOIN ]
    if (data.type === "SOCKET_SEND_TYPE_JOIN") {
      id = data.data.id;

      try {
        joinedUser = joinWebSocketServer(ip, data.data);

        // send client me
        webSocket.send(
          JSON.stringify({
            type: "SOCKET_SEND_TYPE_JOIN_RESPONSE",
            data: {
              id: joinedUser.id,
              map: joinedUser.map,
              position: joinedUser.position,
              speed: joinedUser.speed,
            },
          })
        );

        if (Array.isArray(metaverseData.chats[joinedUser.map]) === false) {
          metaverseData.chats[joinedUser.map] = [];
        }

        // send chat log
        sendChat(webSocket, metaverseData.chats[joinedUser.map]);

        isConnected = true;

        const joinChat = {
          ip: "",
          id: "SERVER",
          content: `${id}님이 접속하셨습니다.`,
          date: new Date().getTime(),
        };
        metaverseData.chats[joinedUser.map]?.push(joinChat);
        sendChatEveryone(webSocketServer.clients, [joinChat]);

        serverLog(`>>> #[${ip}] Join User`, id);
      } catch (error) {
        serverLog(`>>> #[${ip}] Close Socket`, error, id);

        webSocket.send(
          JSON.stringify({
            type: "SOCKET_SEND_TYPE_ALREADY_USE_NICKNAME",
          })
        );

        // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
        webSocket.close(1000);
      }
    }

    // ---------- [ STILL ALIVE ]
    if (data.type === "SOCKET_SEND_TYPE_SERVER_CHECK_RESPONSE") {
      if (isConnected) updateWebSocketUserTime(ip, id);
    }

    // ---------- [ MOVE ]
    if (data.type === "SOCKET_SEND_TYPE_MOVE") {
      if (isConnected) updateWebSocketUser(ip, id, data.data);
    }

    // ---------- [ MOVE ]
    if (data.type === "SOCKET_SEND_TYPE_CHAT") {
      if (isConnected) {
        const chat = {
          ip: ip,
          id: id,
          content: data.data,
          date: new Date().getTime(),
        };
        serverLog(`>>> #[${ip}, ${id}] User Chat`, data.data);

        // save chat log
        metaverseData.chats[joinedUser.map]?.push(chat);

        // send chat log
        sendChatEveryone(webSocketServer.clients, [chat]);
      }
    }

    // ---------- [ CHANGE MAP ]
    if (data.type === "SOCKET_SEND_CHANGE_MAP") {
      // change map log
      serverLog(
        `>>> #[${ip}] Change Map User`,
        id,
        `${joinedUser.map} to ${data.map}`
      );

      // leave origin map chat
      const leaveChat = {
        ip: "",
        id: "SERVER",
        content: `${id}님이 퇴장하셨습니다.`,
        date: new Date().getTime(),
      };
      metaverseData.chats[joinedUser.map]?.push(leaveChat);
      sendChatEveryone(webSocketServer.clients, [leaveChat]);

      // change map
      joinedUser.map = data.map;

      // change init position
      joinedUser.position = [];
      initPosition(ip, id);

      webSocket.send(
        JSON.stringify({
          type: "SOCKET_SEND_CHANGE_MAP_RESPONSE",
          position: joinedUser.position,
        })
      );

      // init map chat list
      if (Array.isArray(metaverseData.chats[joinedUser.map]) === false) {
        metaverseData.chats[joinedUser.map] = [];
      }

      // send chat log
      sendChat(webSocket, metaverseData.chats[joinedUser.map]);

      const joinChat = {
        ip: "",
        id: "SERVER",
        content: `${id}님이 접속하셨습니다.`,
        date: new Date().getTime(),
      };
      metaverseData.chats[joinedUser.map]?.push(joinChat);
      sendChatEveryone(webSocketServer.clients, [joinChat]);
    }
  });

  // ------------------------------ [ CATCH ERROR ]
  webSocket.on("error", function (error) {
    serverLog(`>>> #[${ip}] SOCKET ERROR`, error);
  });

  // ------------------------------ [ CHECK SERVER STATUS, INTERVAL 1000ms ]
  const connectCheckInterval = setInterval(function () {
    if (webSocket.readyState !== webSocket.OPEN) return;
    if (isConnected === false) return;

    webSocket.send(JSON.stringify({ type: "SOCKET_SEND_TYPE_SERVER_CHECK" }));
  }, 1000);

  // ------------------------------ [ SEND USER LIST, INTERVAL 10ms ]
  const sendUserListInterval = setInterval(function () {
    if (webSocket.readyState !== webSocket.OPEN) return;
    if (isConnected === false) return;

    const now = new Date().getTime();
    const users = metaverseData.users
      .filter(
        (user) =>
          user.map === joinedUser.map &&
          user.id !== joinedUser.id &&
          now - user.lastConnection <= 60 * 1000
      )
      .sort((a, b) => b.lastConnection - a.lastConnection)
      .map((user) => ({
        id: user.id,
        position: user.position,
      }));

    webSocket.send(
      JSON.stringify({
        type: "SOCKET_SEND_TYPE_USER_LIST",
        data: users,
      })
    );
  }, 10);

  // ------------------------------ [ CLOSE CONNECT ]
  webSocket.on("close", function () {
    const leaveChat = {
      ip: "",
      id: "SERVER",
      content: `${id}님이 퇴장하셨습니다.`,
      date: new Date().getTime(),
    };
    metaverseData.chats[joinedUser.map]?.push(leaveChat);
    sendChatEveryone(webSocketServer.clients, [leaveChat]);

    serverLog(`>>> #[${ip}] Leave User`, id);
    joinedUser.ip = "";
    joinedUser.lastConnection = 0;
    clearInterval(connectCheckInterval);
    clearInterval(sendUserListInterval);
  });
});
serverLog(`>>> webSocket Running ${port} Port`);

setInterval(function () {
  const now = new Date();
  const clients = metaverseData.users
    .filter((user) => now.getTime() - user.lastConnection <= 60 * 1000)
    .map(
      (user) =>
        `${user.id}(${user.ip}, ${new Date(user.lastConnection).toISOString()})`
    );
  serverLog(`>>> # Joined Users`, clients);
}, 60 * 1000);
