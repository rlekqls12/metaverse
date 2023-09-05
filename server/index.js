import { metaverseData } from "./data.js";
import { createServerApp } from "./express.js";
import { PUBLISH_CLIENT_DIRECTORY } from "./file.js";
import { createWebSocketServer } from "./socket.js";

const port = 80;
const app = createServerApp();
const server = app.listen(port, function () {
  console.log(`>>> Server Running ${port} Port`);
  console.log(">>> Publish", PUBLISH_CLIENT_DIRECTORY);
});

const webSocketServer = createWebSocketServer({ server });
webSocketServer.on("connection", function (webSocket, request) {
  const ip = request.headers["x-forwarded-for"] || request.socket.remoteAddress;

  console.log(">>> Join User", ip);

  webSocket.on("message", function (message) {
    console.log(">>> #SOCKET MESSAGE", message);
  });

  webSocket.on("error", function (error) {
    console.log(">>> #SOCKET ERROR", error);
  });

  const connectCheckInterval = setInterval(function () {
    if (webSocket.readyState !== webSocket.OPEN) return;

    webSocket.send("SERVER_CHECK");
  }, 3000);

  webSocket.on("close", function () {
    console.log(">>> Leave User", ip);
    clearInterval(connectCheckInterval);
  });
});
console.log(`>>> webSocket Running ${port} Port`);
