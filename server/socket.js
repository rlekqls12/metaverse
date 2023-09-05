import { WebSocketServer } from "ws";

export function createWebSocketServer(option) {
  return new WebSocketServer(option);
}
