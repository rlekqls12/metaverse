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
    position: [0, 0],
    speed: 0.1,
  },
};

// join
let isJoined = false;

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
      linkSocket()
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
          joinForm.classList.remove("loading");
          joinButton.setAttribute("disabled", false);
          initForm();
        });
    },
    { once: true }
  );
}

async function linkSocket() {
  // TODO: socket
  const mapResponse = await fetch("../server/map/init.json");

  /** @type { MetaverseMap } */
  const map = await mapResponse.json();
  world.map = map;

  // set start position
  const randomStartIndex = Math.floor(Math.random() * map.start.length);
  world.me.position = [].concat(map.start[randomStartIndex]);
}

function initCanvas() {
  if (canvas === null) return;
  if (context === null) return;

  canvasResize();
  window.addEventListener("resize", canvasResize);
}

function drawCanvas() {
  // get fps
  const now = performance.now();
  renderLogs.push(now);
  renderLogs = renderLogs.filter((log) => now - log < 1000);
  const logLength = renderLogs.length;
  fpsHz = Math.floor(
    logLength * (1000 / (renderLogs[logLength - 1] - renderLogs[0]))
  );

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
 * @property { MetaverseUser } me
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
 * @property { number } speed
 */
