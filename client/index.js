// ---------------------------------------------------------------------- [ VARIABLE ]
/** @type { HTMLCanvasElement | null } */
let canvas = null;
let canvasWidth = 0;
let canvasHeight = 0;

// calculate fps
let renderLogs = [];
let fpsHz = 0;

/** @type { CanvasRenderingContext2D | null } */
let context = null;

/** @type { WebSocket | null } */
let socket = null;

/** @type { MetaverseWorld } */
const world = {
  map: null,
  users: [],
  me: {
    id: "",
    map: "init",
    position: [0, 0],
    speed: 0.1,
  },
};

// join
let isJoined = false;

// window is not focused
let isNotFocusedWindow = false;

const DEBUG = true;

// ---------------------------------------------------------------------- [ INIT ]
window.addEventListener("load", init);

// ---------------------------------------------------------------------- [ FUNCTION ]
function init() {
  canvas = document.getElementById("cvs");
  context = canvas.getContext("2d");

  // nickname max length is 8
  const nicknameInput = document.getElementById("nickname");
  nicknameInput.addEventListener("input", function (event) {
    const text = event.target.value || "";
    if (text.length > 8) {
      event.target.value = text.slice(0, 8);
    }
  });

  initForm();

  // TODO: DEBUG
  if (DEBUG) {
    const nicknameInput = document.getElementById("nickname");
    nicknameInput.value = "tester";
    const joinForm = document.getElementById("join");
    const joinButton = joinForm.querySelector("button");
    joinButton.click();
  }

  requestAnimationFrame(drawCanvas);
}

function initForm() {
  const nicknameInput = document.getElementById("nickname");
  const joinForm = document.getElementById("join");
  const joinButton = joinForm.querySelector("button");

  joinForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      // save nickname
      world.me.id = nicknameInput.value;
      nicknameInput.value = "";

      // loading
      joinForm.classList.add("loading");
      joinButton.setAttribute("disabled", true);

      // socket
      initSocket()
        .then(function () {
          // success
          joinForm.remove();
          initCanvas();
          window.addEventListener("keyup", onKeyChange);
          window.addEventListener("keydown", onKeyChange);
          isJoined = true;
        })
        .catch(function (reason) {
          // failed
          alert(reason);
          console.error(reason);
          joinForm.classList.remove("loading");
          joinButton.setAttribute("disabled", false);
          initForm();
        });
    },
    { once: true }
  );
}

async function initSocket() {
  try {
    socket = await createSocket();

    socket.onclose = function (event) {
      alert("Server Disconnected");
      document.body.remove();
      if (event.wasClean === false) {
        location.reload();
      }
    };

    socket.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);

      // still alive
      if (data.type === "SOCKET_SEND_TYPE_SERVER_CHECK") {
        socket.send(
          JSON.stringify({ type: "SOCKET_SEND_TYPE_SERVER_CHECK_RESPONSE" })
        );
      }

      // another users are using the nickname
      if (data.type === "SOCKET_SEND_TYPE_ALREADY_USE_NICKNAME") {
        socket.onclose = undefined;
        alert("Another user is using that nickname");
        document.body.remove();
        location.reload();
      }

      // TODO: load user list
    });
  } catch {
    alert("Can't Connect Server");
    document.body.remove();
  }

  /** @type { MetaverseMe } */
  const me = await joinServer(socket, world.me.id);
  world.me = me;

  /** @type { MetaverseMap } */
  const map = await loadMap(world.me.map);
  world.map = map;
}

function initCanvas() {
  if (canvas === null) return;
  if (context === null) return;

  canvasResize();
  window.addEventListener("resize", canvasResize);
}

function drawCanvas() {
  isNotFocusedWindow =
    document.hidden ||
    document.visibilityState === "hidden" ||
    document.hasFocus() === false;

  if (isNotFocusedWindow) {
    // if not focused, cant move
    clearKeys();
    requestAnimationFrame(drawCanvas);
    return;
  }

  // get fps
  const now = performance.now();
  renderLogs.push(now);
  renderLogs = renderLogs.filter((log) => now - log < 1000);
  const logLength = renderLogs.length;
  fpsHz = Math.floor(
    logLength * (1000 / (renderLogs[logLength - 1] - renderLogs[0]))
  );
  if (fpsHz === Infinity) fpsHz = 0;

  if (isJoined) {
    drawMap();
    onMove();
  }
  requestAnimationFrame(drawCanvas);
}

function canvasResize() {
  canvasWidth = window.innerWidth * window.devicePixelRatio;
  canvasHeight = window.innerHeight * window.devicePixelRatio;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = canvasWidth / window.devicePixelRatio + "px";
  canvas.style.height = canvasHeight / window.devicePixelRatio + "px";
}

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @typedef MetaverseWorld
 * @property { MetaverseMap | null } map
 * @property { MetaverseUser[] } users
 * @property { MetaverseMe } me
 */

/**
 * @typedef MetaverseMap
 * @property { string } id
 * @property { number[] } size
 * @property { number[][] } start
 * @property { number[][] } wall
 */

/**
 * @typedef MetaverseUser
 * @property { string } id
 * @property { number[] } position
 */

/**
 * @typedef MetaverseMe
 * @property { string } id
 * @property { string } map
 * @property { number[] } position
 * @property { number } speed
 */
