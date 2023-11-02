// ---------------------------------------------------------------------- [ VARIABLE ]
/** @type { HTMLCanvasElement | null } */
let canvas = null;
let canvasWidth = 0;
let canvasHeight = 0;

/** @type { CanvasRenderingContext2D | null } */
let context = null;

/** @type { WebSocket | null } */
let socket = null;

/** @type { MetaverseWorld } */
const world = {
  map: null,
  users: [],
  chats: [],
  me: {
    id: "",
    map: "init",
    position: [0, 0],
    speed: 0.1,
  },
};

// calculate fps
let renderLogs = [];
let fpsHz = 0;

// join
let isJoined = false;
let joinedTime = 0;

// window is not focused
let isNotFocusedWindow = false;

// changing map
let isChangingMap = false;

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
  setTimeout(nicknameInput.focus, 0);

  // chat content max length is 180
  const chatBox = document.getElementById("chat");
  chatBox.addEventListener("input", function (event) {
    const text = event.target.value || "";
    if (text.length > 180) {
      event.target.value = text.slice(0, 180);
    }
  });

  initForm();

  // TODO: DEBUG
  // if (DEBUG) {
  //   const randomId = Array.from({ length: 4 }, () =>
  //     Math.floor(Math.random() * 36).toString(36)
  //   ).join("");
  //   const nicknameInput = document.getElementById("nickname");
  //   nicknameInput.value = "#" + randomId;
  //   const joinForm = document.getElementById("join");
  //   const joinButton = joinForm.querySelector("button");
  //   joinButton.click();
  // }

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
      initSocket()
        .then(function () {
          // success
          joinForm.remove();
          initCanvas();
          window.addEventListener("keyup", onKeyChange);
          window.addEventListener("keydown", onKeyChange);
          isJoined = true;
          joinedTime = new Date().getTime();
        })
        .catch(function (reason) {
          // failed
          alert(reason);
          console.error(reason);
          joinForm.classList.remove("loading");
          joinButton.setAttribute("disabled", false);
          initForm();
        });
    },
    { once: true }
  );
}

async function initSocket() {
  try {
    socket = await createSocket();

    socket.onclose = function (event) {
      alert("Server Disconnected");
      document.body.remove();
      if (event.wasClean === false) {
        location.reload();
      }
    };

    socket.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);

      // still alive
      if (data.type === "SOCKET_SEND_TYPE_SERVER_CHECK") {
        socket.send(
          JSON.stringify({ type: "SOCKET_SEND_TYPE_SERVER_CHECK_RESPONSE" })
        );
      }

      // another users are using the nickname
      if (data.type === "SOCKET_SEND_TYPE_ALREADY_USE_NICKNAME") {
        socket.onclose = undefined;
        alert("Another user is using that nickname");
        document.body.remove();
        location.reload();
      }

      // load user list
      if (data.type === "SOCKET_SEND_TYPE_USER_LIST") {
        world.users = data.data || [];

        // send my position
        socket.send(
          JSON.stringify({
            type: "SOCKET_SEND_TYPE_MOVE",
            data: world.me.position,
          })
        );
      }

      // load chat log
      if (data.type === "SOCKET_SEND_TYPE_CHAT_LOG") {
        world.chats.push(...data.data);

        const chatLogBox = document.getElementById("chat-log");
        data.data.forEach(function (chat) {
          const [red, green, blue] = getColor(chat.id);
          const chatItemBox = document.createElement("div");
          chatItemBox.classList.add("chat-item");

          const chatTime = document.createElement("span");
          chatTime.classList.add("chat-time");
          chatTime.textContent = new Date(chat.date).toLocaleString("ko");
          chatItemBox.appendChild(chatTime);

          const chatId = document.createElement("span");
          chatId.classList.add("chat-id");
          chatId.style.color = `rgb(${red}, ${green}, ${blue})`;
          chatId.textContent = chat.id;
          chatItemBox.appendChild(chatId);

          const chatContent = document.createElement("div");
          chatContent.classList.add("chat-content");
          chatContent.innerHTML = chat.content.replaceAll("\n", "<br />");
          chatItemBox.appendChild(chatContent);

          chatLogBox.appendChild(chatItemBox);
        });

        const now = new Date().getTime();
        chatLogBox.dataset.lastchat = now;
        chatLogBox.style.opacity = 1;
        chatLogBox.scrollTo(0, chatLogBox.scrollHeight);

        setTimeout(function () {
          const now = new Date().getTime();
          if (now - chatLogBox.dataset.lastchat >= 7000) {
            chatLogBox.style.opacity = 0;
          }
        }, 7100);
      }

      // change map my position
      if (data.type === "SOCKET_SEND_CHANGE_MAP_RESPONSE") {
        world.me.position = data.position || [0, 0];
      }
    });
  } catch {
    alert("Can't Connect Server");
    document.body.remove();
  }

  /** @type { MetaverseMe } */
  const me = await joinServer(socket, world.me.id);
  world.me = me;

  /** @type { MetaverseMap } */
  const map = await loadMap(world.me.map);
  world.map = map;
}

function initCanvas() {
  if (canvas === null) return;
  if (context === null) return;

  canvasResize();
  window.addEventListener("resize", canvasResize);
}

function drawCanvas() {
  isNotFocusedWindow = document.hidden || document.visibilityState === "hidden";

  if (isNotFocusedWindow || isChangingMap) {
    // if not focused, cant move
    clearKeys();
    requestAnimationFrame(drawCanvas);
    return;
  }

  // get fps
  const now = performance.now();
  renderLogs.push(now);
  renderLogs = renderLogs.filter((log) => now - log < 1000);
  const logLength = renderLogs.length;
  fpsHz = Math.floor(
    logLength * (1000 / (renderLogs[logLength - 1] - renderLogs[0]))
  );
  if (fpsHz === Infinity) fpsHz = 0;

  if (isJoined) {
    drawMap();
    onKey();

    // user list box
    const userList = document.getElementById("user-list");
    const nowTime = new Date().getTime();
    const isNeedUpdate = nowTime - userList.dataset.lastupdate > 1500;
    if (userList.checkVisibility() && isNeedUpdate) {
      userList.dataset.lastupdate = nowTime;
      userList.replaceChildren();

      const userItemList = [];
      [world.me, ...world.users].forEach(function (user) {
        const [red, green, blue] = getColor(user.id);

        const userItemBox = document.createElement("div");
        userItemBox.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
        userItemBox.style.padding = "2px 5px";
        userItemBox.style.borderRadius = "4px";

        const userId = document.createElement("span");
        userId.textContent = user.id;
        userId.style.color = `rgb(${255 - red}, ${255 - green}, ${255 - blue})`;
        userItemBox.appendChild(userId);

        const userPosition = document.createElement("span");
        userPosition.textContent = `(${user.position
          .map(Math.floor)
          .join(", ")})`;
        userPosition.style.color = `rgb(${255 - red}, ${255 - green}, ${
          255 - blue
        })`;
        userItemBox.appendChild(userPosition);

        userItemList.push(userItemBox);
      });

      userList.append(...userItemList);
    }
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

async function changeMap(mapId) {
  if (world.map.id === mapId) return alert("cannot move to the same map");

  isChangingMap = true;

  let map = {};
  try {
    map = await loadMap(mapId);
  } catch {
    isChangingMap = false;
    alert("change map failed");
    return;
  }

  world.map = map;

  const chatLogBox = document.getElementById("chat-log");
  chatLogBox.replaceChildren();

  world.chats = [];

  socket.send(JSON.stringify({ type: "SOCKET_SEND_CHANGE_MAP", map: mapId }));

  isChangingMap = false;
}

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @typedef MetaverseWorld
 * @property { MetaverseMap | null } map
 * @property { MetaverseUser[] } users
 * @property { MetaverseChat[] } chats
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
 * @typedef MetaverseUser
 * @property { string } id
 * @property { number[] } position
 */

/**
 * @typedef MetaverseChat
 * @property { string } ip
 * @property { string } id
 * @property { string } content
 * @property { number } date
 */

/**
 * @typedef MetaverseMe
 * @property { string } id
 * @property { string } map
 * @property { number[] } position
 * @property { number } speed
 */
