let mouseMatrix = [0, 0];
let isMouseDown = false;

function initMouse() {
  window.addEventListener("mousemove", onMouseEvent);
  window.addEventListener("mousedown", onMouseEvent);
  window.addEventListener("mouseup", onMouseEvent);
}

function onMouseEvent(event) {
  mouseMatrix = [event.clientX, event.clientY];

  const type = event.type; // mousemove, mousedown, mouseup
  if (["mousedown", "mouseup"].includes(type)) {
    isMouseDown = type === "mousedown";
  }
}
