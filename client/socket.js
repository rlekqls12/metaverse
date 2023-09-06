async function createSocket() {
  const host = location.host;
  const webSocket = new WebSocket("ws://" + host);

  let resolver = () => void 0;
  const waitConnectSocket = new Promise(function (resolve) {
    resolver = resolve;
  });

  webSocket.onopen = function (event) {
    resolver();
  };

  await waitConnectSocket;

  return webSocket;
}

async function receiveOnceWebSocketMessage(webSocket) {
  // receiver
  let resolver = () => void 0;
  const receiver = new Promise(function (resolve) {
    resolver = resolve;
  });

  // receive me
  webSocket.addEventListener(
    "message",
    function (event) {
      const data = JSON.parse(event.data);
      resolver(data);
    },
    { once: true }
  );

  return receiver;
}

async function loadMap(name) {
  const mapResponse = await fetch(`/map/${name}`);
  const map = await mapResponse.json();
  return map;
}

/**
 * @param { WebSocket } webSocket
 */
async function joinServer(webSocket, id) {
  // receiver
  let resolver = () => void 0;
  const receiver = new Promise(function (resolve) {
    resolver = resolve;
  });

  // receive me
  receiveOnceWebSocketMessage(webSocket).then(async function (message) {
    while (message.type !== "SOCKET_SEND_TYPE_JOIN_RESPONSE") {
      message = await receiveOnceWebSocketMessage(webSocket);
    }

    resolver(message.data);
  });

  // send id
  webSocket.send(
    JSON.stringify({ type: "SOCKET_SEND_TYPE_JOIN", data: { id: id } })
  );

  return receiver;
}
