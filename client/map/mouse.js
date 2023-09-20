let mouseMatrix = [0, 0];
let isMouseDown = false;
let mouseEffectList = [];

function initMouse() {
  window.addEventListener("mousemove", onMouseEvent);
  window.addEventListener("mousedown", onMouseEvent);
  window.addEventListener("mouseup", onMouseEvent);
}

function onMouseEvent(event) {
  mouseMatrix = [event.clientX, event.clientY].map(
    (position) => position * window.devicePixelRatio
  );

  const type = event.type; // mousemove, mousedown, mouseup
  if (["mousedown", "mouseup"].includes(type)) {
    if (type === "mouseup") {
      mouseEffectList = [];
    }
    isMouseDown = type === "mousedown";
  }
}
