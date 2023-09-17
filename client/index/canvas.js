function drawMap() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  drawTile();
  drawUsers();
  drawFps();
  drawPosition();
  drawMapId();
  drawHelper();
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
      const tileX = -positionX + halfX + nowX * tileSize - tileSize * 0.5; // tileSize * 0.5 is tile correction
      const tileY = -positionY + halfY + nowY * tileSize - tileSize * 0.5; // tileSize * 0.5 is tile correction

      const isWall = wall.find(([wx, wy]) => wx === nowX && wy === nowY);
      if (isWall) {
        context.strokeStyle = "rgb(100, 100, 100)";
        context.fillRect(tileX, tileY, tileSize, tileSize);
      } else {
        context.strokeStyle = "rgba(255, 255, 255, 0.05)";
      }

      context.strokeRect(tileX, tileY, tileSize, tileSize);
    }
  }
}

function getTileSize() {
  const tileSize = Math.floor(Math.min(canvasWidth, canvasHeight) / 28);
  return tileSize;
}

function getUserHalfSize() {
  return (getTileSize() / 2) * 0.75;
}

function drawUsers() {
  const [centerX, centerY] = [canvasWidth, canvasHeight].map((v) => v / 2);

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

  // me
  drawUser(world.me.id, centerX, centerY);
}

function drawUser(id, x, y) {
  // color
  const [red, green, blue] = getColor(id);

  // user
  const userSize = getUserHalfSize();
  context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
  context.beginPath();
  context.arc(x, y, userSize, 0, Math.PI * 2, true);
  context.fill();
  context.closePath();

  // id
  context.textBaseline = "alphabetic";
  context.textAlign = "center";
  context.fillStyle = "lightgray";
  context.fillText(id, x, y + getFontSize() * 1.75);

  // chat
  const now = new Date().getTime();
  const findRecentChat = world.chats
    .sort((a, b) => b.date - a.date)
    .find((chat) => chat.id === id && now - chat.date <= 7000);
  if (findRecentChat) {
    context.textBaseline = "bottom";
    context.textAlign = "center";
    context.fillStyle = "white";

    if (findRecentChat.content.includes("\n")) {
      const chatLineList = findRecentChat.content.split("\n");
      chatLineList.forEach(function (chat, chatIdx) {
        drawText(
          chat,
          x,
          y - getFontSize() * (chatLineList.length - chatIdx + 0.5),
          200
        );
      });
    } else {
      drawText(findRecentChat.content, x, y - getFontSize() * 1.5, 200);
    }
  }
}

function drawText(text, x, y, maxWidth) {
  if (maxWidth === 0) {
    context.fillText(text, x, y);
  } else {
    while (context.measureText(text).width > maxWidth) {
      text = text.split("...")[0];
      text = text.slice(0, -1) + "...";
    }
    context.fillText(text, x, y);
  }
}

function getColor(id) {
  // color
  const red =
    id.split("").reduce((sum, word) => sum + word.charCodeAt() * 333, 0) % 255;
  const green = (id.length * 33) % 255;
  const blue = ((1 / red) * 1000) % 255;
  return [red, green, blue];
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

function drawMapId() {
  const [positionX, positionY] = world.me.position.map(Math.floor);

  context.fillStyle = "white";
  context.textBaseline = "alphabetic";
  context.textAlign = "center";
  setFontSize(16);
  context.fillText(world.map.id, canvasWidth / 2, getFontSize() * 2);
}

function setFontSize(size) {
  if (isNaN(Number(size))) return;
  if (size <= 0) return;

  context.font = context.font.replace(getFontSize(), size);
}

function getFontSize() {
  return parseInt(context.font);
}

function drawHelper() {
  const now = new Date().getTime();
  if (now - joinedTime > 6000) return;

  const [centerX, centerY] = [canvasWidth, canvasHeight].map((v) => v / 2);
  const backPlateSize = { width: 150, height: 135 };
  const [baseX, baseY] = [
    centerX - backPlateSize.width / 2,
    centerY - backPlateSize.height * 1.5,
  ];

  // backplate
  context.fillStyle = "rgb(75, 75, 75)";
  context.strokeStyle = "rgb(105, 105, 105)";
  context.fillRect(baseX, baseY, backPlateSize.width, backPlateSize.height);
  context.strokeRect(baseX, baseY, backPlateSize.width, backPlateSize.height);

  // text
  const fontSize = getFontSize();
  context.textAlign = "center";
  context.textBaseline = "middle";

  // text - chat
  context.fillStyle = "rgb(125, 200, 200)";
  context.fillText(
    "Help",
    centerX,
    centerY - backPlateSize.height - fontSize * 3
  );

  // text - chat
  context.fillStyle = "lightgray";
  context.fillText(
    "Chat",
    centerX - 25,
    centerY - backPlateSize.height - fontSize * 1
  );
  context.fillStyle = "rgb(125, 200, 125)";
  context.fillText(
    "Enter",
    centerX + 35,
    centerY - backPlateSize.height - fontSize * 1
  );

  // text - user list
  context.fillStyle = "lightgray";
  context.fillText(
    "User List",
    centerX - 25,
    centerY - backPlateSize.height + fontSize * 1
  );
  context.fillStyle = "rgb(125, 200, 125)";
  context.fillText(
    "Tab",
    centerX + 35,
    centerY - backPlateSize.height + fontSize * 1
  );

  // text - change map
  context.fillStyle = "lightgray";
  context.fillText(
    "Other Map",
    centerX - 25,
    centerY - backPlateSize.height + fontSize * 3
  );
  context.fillStyle = "rgb(125, 200, 125)";
  context.fillText(
    "M",
    centerX + 35,
    centerY - backPlateSize.height + fontSize * 3
  );
}
