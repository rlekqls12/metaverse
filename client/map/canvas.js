function drawMap() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  drawTile();
  drawFps();
  drawPosition();
  drawMousePosition();
}

function drawTile() {
  const { map, me } = world;
  const { size, wall } = map;

  const tileSize = getTileSize();
  const [halfX, halfY] = [canvasWidth, canvasHeight].map((v) => v / 2);
  const [sizeX, sizeY] = size.map((v) => v / 2);
  const [positionX, positionY] = me.position.map((v) => v * tileSize);

  context.lineWidth = 2;
  let cursor = "default";

  for (let y = -sizeY; y < sizeY; y++) {
    for (let x = -sizeX; x < sizeX; x++) {
      const nowX = x + sizeX;
      const nowY = y + sizeY;
      const tileX = -positionX + halfX + nowX * tileSize;
      const tileY = -positionY + halfY + nowY * tileSize;
      const mouseX = Math.floor(
        (positionX + mouseMatrix[0] - halfX) / tileSize
      );
      const mouseY = Math.floor(
        (positionY + mouseMatrix[1] - halfY) / tileSize
      );

      if (nowX === mouseX && nowY === mouseY) {
        cursor = "pointer";
        context.fillStyle = "rgb(100, 175, 100)";
        context.fillRect(tileX, tileY, tileSize, tileSize);
      } else {
        context.fillStyle = "rgb(100, 100, 100)";

        const isWall = wall.find(([wx, wy]) => wx === nowX && wy === nowY);
        if (isWall) {
          context.strokeStyle = "rgb(100, 100, 100)";
          context.fillRect(tileX, tileY, tileSize, tileSize);
        } else {
          context.strokeStyle = "rgba(255, 255, 255, 0.05)";
        }
      }

      context.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }

  canvas.style.cursor = cursor;
}

function getTileSize() {
  const tileSize = Math.floor(Math.min(canvasWidth, canvasHeight) / 28);
  return tileSize;
}

function drawFps() {
  context.fillStyle = "white";
  context.textBaseline = "alphabetic";
  context.textAlign = "end";
  setFontSize(16);
  context.fillText(fpsHz + " FPS", canvasWidth, getFontSize());
}

function drawPosition() {
  const [positionX, positionY] = world.me.position.map(Math.floor);
  const positionText = `(${positionX}, ${positionY})`;

  context.fillStyle = "white";
  context.textBaseline = "alphabetic";
  context.textAlign = "center";
  setFontSize(16);
  context.fillText(positionText, canvasWidth / 2, getFontSize());
}

function drawMousePosition() {
  const tileSize = getTileSize();
  const [halfX, halfY] = [canvasWidth, canvasHeight].map((v) => v / 2);
  const [positionX, positionY] = world.me.position.map((v) => v * tileSize);
  const [mouseX, mouseY] = mouseMatrix.map(Math.floor);
  const x = Math.floor((positionX + mouseX - halfX) / tileSize);
  const y = Math.floor((positionY + mouseY - halfY) / tileSize);
  const mouseText = `(${x}, ${y})`;

  context.fillStyle = "rgb(100, 175, 100)";
  context.textBaseline = "alphabetic";
  context.textAlign = "center";
  setFontSize(16);
  context.fillText(mouseText, canvasWidth / 2, 2.25 * getFontSize());
}

function setFontSize(size) {
  if (isNaN(Number(size))) return;
  if (size <= 0) return;

  context.font = context.font.replace(getFontSize(), size);
}

function getFontSize() {
  return parseInt(context.font);
}
