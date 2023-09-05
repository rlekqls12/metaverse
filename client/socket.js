async function linkSocket() {
  // TODO: socket
  const mapResponse = await fetch("../server/map/init.json");
  const map = await mapResponse.json();

  return { map };
}

function sendMove(x, y) {
  // TODO:
}
