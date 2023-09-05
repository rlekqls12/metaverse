async function createSocket() {
  const webSocket = new WebSocket("ws://localhost:80");

  let resolver = () => void 0;
  const waitConnectSocket = new Promise(function (resolve) {
    resolver = resolve;
  });

  webSocket.onopen(function (event) {
    console.log("Socket Open >>>", this, event);
    resolver();
  });

  await waitConnectSocket;

  return webSocket;
}

/**
 * @param { WebSocket } webSocket
 */
async function joinServer(webSocket, id) {
  webSocket.send("join", id);
}

async function loadMap(name) {
  const mapResponse = await fetch(`/map/${name}`);
  const map = await mapResponse.json();
  return { map };
}

function sendMove(x, y) {
  // TODO:
}
