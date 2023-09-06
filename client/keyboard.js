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

function clearKeys() {
  Object.keys(keys).forEach(function (key) {
    delete keys[key];
  });
}

function onMove() {
  const keyList = Object.keys(keys);

  let x = 0;
  let y = 0;
  // every fps, same speed
  const speed = world.me.speed * (60 / fpsHz);
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

  // TODO: check cant move

  world.me.position[0] += x;
  world.me.position[1] += y;
}
