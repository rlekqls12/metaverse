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

  const tileSize = getTileSize();
  const [halfX, halfY] = [canvasWidth, canvasHeight].map((v) => v / 2);
  const [sizeX, sizeY] = size.map((v) => v / 2);
  const [positionX, positionY] = me.position.map((v) => v * tileSize);

  context.fillStyle = "rgb(100, 100, 100)";
  context.lineWidth = 2;

  for (let y = -sizeY; y < sizeY; y++) {
    for (let x = -sizeX; x < sizeX; x++) {
      const nowX = x + sizeX;
      const nowY = y + sizeY;
      const tileX = -positionX + halfX + nowX * tileSize;
      const tileY = -positionY + halfY + nowY * tileSize;

      const isWall = wall.find(([wx, wy]) => wx === nowX && wy === nowY);
      if (isWall) {
        context.strokeStyle = "rgba(100, 100, 100, 1)";
        context.fillRect(tileX, tileY, tileSize, tileSize);
      } else {
        context.strokeStyle = "rgba(255, 255, 255, 0.05)";
      }

      context.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }
}

function getTileSize() {
  const tileSize = Math.floor(Math.min(canvasWidth, canvasHeight) / 18);
  return tileSize;
}

function drawUsers() {
  const [centerX, centerY] = [canvasWidth, canvasHeight].map((v) => v / 2);

  // me
  drawUser(world.me.id, centerX, centerY);

  const tileSize = getTileSize();
  const [baseX, baseY] = world.me.position;

  // other user
  world.users.forEach(function (user) {
    const [x, y] = user.position;
    drawUser(
      user.id,
      centerX + (x - baseX) * tileSize,
      centerY + (y - baseY) * tileSize
    );
  });
}

function drawUser(id, x, y) {
  // color
  const red =
    id.split("").reduce((sum, word) => sum + word.charCodeAt() * 333, 0) % 255;
  const green = (id.length * 33) % 255;
  const blue = ((1 / red) * 1000) % 255;

  // user
  context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
  context.beginPath();
  context.arc(x, y, 8, 0, Math.PI * 2, true);
  context.fill();
  context.closePath();

  // id
  context.fillStyle = "white";
  context.fillText(id, x, y - getFontSize());
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
