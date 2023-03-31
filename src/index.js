import template from "./template";

let count = 0;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleSession(websocket) {
  websocket.accept();
  websocket.addEventListener("message", async ({ data }) => {
    if (data === "CLICK") {
      count += 1;
      websocket.send(JSON.stringify({ count, tz: new Date() }));
    } else {
      // An unknown message came into the server. Send back an error message
      websocket.send(
        JSON.stringify({ error: "Unknown message received", tz: new Date() })
      );
    }
  });

  websocket.addEventListener("close", async (event) => {
    // Handle when a client closes the WebSocket connection
    count = 0;
    websocket.send(JSON.stringify({ count, tz: new Date() }));
    console.log("ConnectionClosed", event);
  });
}

const websocketHandler = async (request) => {
  const upgradeHeader = request.headers.get("Upgrade");
  const key = request.headers.get("sec-websocket-key");
  console.log("Key", key);
  if (upgradeHeader !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  const [client, server] = Object.values(new WebSocketPair());
  await handleSession(server);
  console.log("CLIENT", JSON.parse(client));
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/":
        return template();
      case "/ws":
        return websocketHandler(request);
      default:
        return new Response("Not found", { status: 404 });
    }
  } catch (err) {
    return new Response(err.toString());
  }
}
