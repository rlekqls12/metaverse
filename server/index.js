import { createServer } from "./express.js";
import { PUBLISH_CLIENT_DIRECTORY } from "./file.js";
import { createWebSocket } from "./socket.js";

const server = createServer();
server.listen(port, function () {
  console.log(">>> Server Running 80 Port");
  console.log(">>> Publish", PUBLISH_CLIENT_DIRECTORY);
});

const webSocket = createWebSocket(server);
