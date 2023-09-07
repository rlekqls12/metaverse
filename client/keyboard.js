const keys = {};
const keysTimeline = {};

function onKeyChange(event) {
  const key = event.key.toLowerCase();

  if (event.type === "keydown") {
    keys[key] = true;
    keysTimeline[key] = new Date().getTime();
  }
  if (event.type === "keyup") {
    delete keys[key];

    if (key === "enter" || key === "escape") {
      const chatBox = document.getElementById("chat");
      chatBox.dataset.open = "0";
    }
  }
}

function clearKeys() {
  Object.keys(keys).forEach(function (key) {
    delete keys[key];
  });
}

function onKey() {
  onMove();
  onChat();
}

function onMove() {
  if (isJoined === false) return;

  const chatBox = document.getElementById("chat");
  const isChatBoxShow = getComputedStyle(chatBox).display !== "none";
  if (isChatBoxShow) return;

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

function onChat() {
  if (isJoined === false) return;

  const keyList = Object.keys(keys);
  const chatBox = document.getElementById("chat");
  const isChatBoxShow = getComputedStyle(chatBox).display !== "none";

  if (keyList.includes("escape") && isChatBoxShow) {
    chatBox.style.display = "none";
    chatBox.value = "";
    return;
  }

  const now = new Date().getTime();
  const lastPushShiftKey = keysTimeline.shift || 0;
  if (
    keyList.includes("enter") &&
    keyList.includes("shift") === false &&
    now - lastPushShiftKey > 500 &&
    chatBox.dataset.open === "0"
  ) {
    chatBox.dataset.open = "1";
    chatBox.style.display = isChatBoxShow ? "none" : "block";

    if (isChatBoxShow === false) {
      chatBox.focus();
    } else {
      const content = chatBox.value;
      chatBox.value = "";
      if (content.replaceAll(" ", "").replaceAll("\n", "").length === 0) return;

      socket.send(
        JSON.stringify({
          type: "SOCKET_SEND_TYPE_CHAT",
          data: content.replace(/(\n)$/, ""),
        })
      );
    }
  }
}
