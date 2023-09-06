export function serverLog(...content) {
  console.log(`[${new Date().toLocaleString("ko")}]`, ...content);
}
