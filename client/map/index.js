// ---------------------------------------------------------------------- [ VARIABLE ]
/** @type { HTMLCanvasElement | null } */
let canvas = null;
let canvasWidth = 0;
let canvasHeight = 0;

/** @type { CanvasRenderingContext2D | null } */
let context = null;

/** @type { MetaverseWorld } */
const world = {
  map: {
    id: "",
    size: [15, 15],
    start: [],
    wall: [],
  },
  me: {
    position: [7.5, 7.5],
  },
};

// block type (Start, Wall)
let blockType = "Start";

// calculate fps
let renderLogs = [];
let fpsHz = 0;

// ---------------------------------------------------------------------- [ INIT ]
window.addEventListener("load", init);

// ---------------------------------------------------------------------- [ FUNCTION ]
function init() {
  canvas = document.getElementById("cvs");
  context = canvas.getContext("2d");

  const mapInfo = document.getElementById("map-info");

  const mapInfoToggle = document.getElementById("map-toggle");
  mapInfoToggle.addEventListener("click", function () {
    mapInfo.classList.toggle("hide");
  });

  const blockTypeToggle = document.getElementById("button-block-type");
  blockTypeToggle.addEventListener("click", function () {
    blockTypeToggle.textContent = blockType === "Start" ? "Wall" : "Start";
    blockType = blockType === "Start" ? "Wall" : "Start";
  });

  document
    .getElementById("input-width")
    .addEventListener("change", function (event) {
      const value = event.target.value;
      if (Boolean(value) === false) return;
      world.map.size[0] = value;
    });
  document
    .getElementById("input-height")
    .addEventListener("change", function (event) {
      const value = event.target.value;
      if (Boolean(value) === false) return;
      world.map.size[1] = value;
    });

  window.addEventListener("keyup", onKeyChange);
  window.addEventListener("keydown", onKeyChange);

  initCanvas();
  initMouse();

  requestAnimationFrame(drawCanvas);
}

function initCanvas() {
  if (canvas === null) return;
  if (context === null) return;

  canvasResize();
  window.addEventListener("resize", canvasResize);
}

function canvasResize() {
  canvasWidth = window.innerWidth * window.devicePixelRatio;
  canvasHeight = window.innerHeight * window.devicePixelRatio;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = canvasWidth / window.devicePixelRatio + "px";
  canvas.style.height = canvasHeight / window.devicePixelRatio + "px";
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
  if (fpsHz === Infinity) fpsHz = 0;

  drawMap();
  onKey();

  requestAnimationFrame(drawCanvas);
}

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @typedef MetaverseWorld
 * @property { MetaverseMap } map
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
 * @typedef MetaverseMe
 * @property { number[] } position
 */
