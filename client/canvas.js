function drawMap() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  drawTile();
  drawUsers();
  drawFps();
  drawPosition();
}

function drawTile() {
  const { map, me } = world;
  const { size, wall } = map;

  const [halfX, halfY] = [canvasWidth, canvasHeight].map((v) => v / 2);
  const [sizeX, sizeY] = size.map((v) => v / 2);
  const tileSize = Math.floor(Math.min(canvasWidth, canvasHeight) / 18);
  const [positionX, positionY] = me.position.map((v) => v * tileSize);

  context.fillStyle = "rgb(245, 222, 179)";
  context.lineWidth = 2;

  for (let y = -sizeY; y < sizeY; y++) {
    for (let x = -sizeX; x < sizeX; x++) {
      const nowX = x + sizeX;
      const nowY = y + sizeY;
      const tileX = -positionX + halfX + nowX * tileSize;
      const tileY = -positionY + halfY + nowY * tileSize;

      const isWall = wall.find(([wx, wy]) => wx === nowX && wy === nowY);
      if (isWall) {
        context.strokeStyle = "rgba(245, 222, 179, 1)";
        context.fillRect(tileX, tileY, tileSize, tileSize);
      } else {
        context.strokeStyle = "rgba(255, 255, 255, 0.05)";
      }

      context.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }
}

function drawUsers() {
  // me
  context.fillStyle = "red";
  context.arc(canvasWidth / 2, canvasHeight / 2, 8, 0, Math.PI * 2, true);
  context.fill();

  // TODO: other
}

function drawFps() {
  context.fillStyle = "white";
  context.textAlign = "end";
  setFontSize(16);
  context.fillText(fpsHz + " FPS", canvasWidth, getFontSize());
}

function drawPosition() {
  const [positionX, positionY] = world.me.position.map(Math.floor);
  const positionText = `(${positionX}, ${positionY})`;

  context.fillStyle = "white";
  context.textAlign = "center";
  setFontSize(16);
  context.fillText(positionText, canvasWidth / 2, getFontSize());
}

function setFontSize(size) {
  if (isNaN(Number(size))) return;
  if (size <= 0) return;

  context.font = context.font.replace(getFontSize(), size);
}

function getFontSize() {
  return parseInt(context.font);
}
