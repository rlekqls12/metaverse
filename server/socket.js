import ws from "ws";

export function createWebSocket(option) {
  return new ws.WebSocket(option);
}
