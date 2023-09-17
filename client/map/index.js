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

// block type (Start, Wall, Erase)
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
    const nextBlockType = {
      Start: "Wall",
      Wall: "Erase",
      Erase: "Start",
    };
    blockTypeToggle.textContent = nextBlockType[blockType];
    blockType = nextBlockType[blockType];
  });

  const loadButton = document.getElementById("button-load");
  loadButton.addEventListener("click", loadMap);

  const saveButton = document.getElementById("button-save");
  saveButton.addEventListener("click", saveMap);

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

function loadMap() {
  const mapInfo = prompt("input map data (please remove white-space)");
  if (mapInfo === null) return;

  let mapObject = {};
  try {
    mapObject = JSON.parse(mapInfo);

    const isMapObject =
      "id" in mapObject &&
      "size" in mapObject &&
      "start" in mapObject &&
      "wall" in mapObject;
    if (isMapObject === false) throw new Error("is not map data");
  } catch {
    alert("is not map data");
  }

  world.map = mapObject;
}

async function saveMap() {
  const mapId = prompt("map name (max 100)");
  if (mapId === null) return;
  if (mapId.trim() === "") return saveMap();
  if (mapId.trim().length > 100) {
    alert("map name max length is 100");
    return saveMap();
  }

  world.map.id = mapId.trim();

  // save Map
  try {
    const saveResponse = await fetch(`/map/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: world.map,
      }),
    });

    if (saveResponse.status === 200) {
      console.log(world.map);
      alert("save done, press f12 and see your map raw data");
    } else {
      const responseText = await saveResponse.text();
      alert(responseText);
    }
  } catch (error) {
    alert("Save Error: " + JSON.stringify(error));
  }
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
