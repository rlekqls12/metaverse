const keys = {};

function onKeyChange(event) {
  const key = event.key.toLowerCase();
  if (event.type === "keydown") {
    keys[key] = true;
  }
  if (event.type === "keyup") {
    delete keys[key];
  }
}

function onKey() {
  onMove();
}

function onMove() {
  const keyList = Object.keys(keys);

  let x = 0;
  let y = 0;
  // every fps, same speed
  const speed = 0.4 * (60 / fpsHz);
  if (keyList.includes("w")) {
    y -= speed;
  }
  if (keyList.includes("s")) {
    y += speed;
  }
  if (keyList.includes("a")) {
    x -= speed;
  }
  if (keyList.includes("d")) {
    x += speed;
  }

  world.me.position[0] += x;
  world.me.position[1] += y;
}
