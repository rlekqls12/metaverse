import { metaverseData } from "./data.js";
import { createServer } from "./express.js";
import { PUBLISH_CLIENT_DIRECTORY } from "./file.js";
import { createWebSocketServer, addWebSocketEvent } from "./socket.js";

const port = 80;
const server = createServer();
server.listen(port, function () {
  console.log(`>>> Server Running ${port} Port`);
  console.log(">>> Publish", PUBLISH_CLIENT_DIRECTORY);
});

const webSocketServer = createWebSocketServer({ server });
console.log(`>>> webSocket Running ${port} Port`);
addWebSocketEvent(webSocketServer, function (webSocket, request) {
  const ip =
    request.headers["x-forwarded-for"] || request.socket.address().address;

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
