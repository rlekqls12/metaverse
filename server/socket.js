import WebSocket, { WebSocketServer } from "ws";

export function createWebSocketServer(option) {
  return new WebSocketServer(option);
}

/**
 * @param { WebSocket.Server } webSocket
 * @param { WebSocketEventListener } eventListener
 */
export function addWebSocketEvent(webSocket, eventListener) {
  webSocket.on("connection", eventListener);
}

// ---------------------------------------------------------------------- [ TYPE ]
/**
 * @callback WebSocketEventListener
 * @param { WebSocket } webSocket
 * @param { import("http").IncomingMessage } request
 */
