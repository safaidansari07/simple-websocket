const template = `
<style>
  body {
    margin: 1rem;
    font-family: Arial, sans-serif;
    background-color: #f1f1f1;
  }
  h4 {
    font-size: 1.2rem;
    margin-top: 2rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background-color: #fff;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
  }
  p {
    margin-bottom: 1rem;
  }
  #error {
    font-size: 0.9rem;
    font-weight: bold;
  }
  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 0.25rem;
    cursor: pointer;
    background-color: #4caf50;
    color: #fff;
    border: none;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
  }
  button:hover {
    background-color: #3e8e41;
  }
  button:active {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    transform: translateY(1px);
  }
</style>
<p>Number of clicks: <span id="num"></span></p>
<button id="click">Click me</button>
<p>You can also send a message that the WebSocket server doesn't recognize. This will cause the WebSocket server to return an "error" payload back to the client.</p>
<button id="unknown">Simulate Unknown Message</button>
<p>When you're done clicking, you can close the connection below. Further clicks won't work until you refresh the page.</p>
<button id="close">Close connection</button>
<p id="error" style="color: red;"></p>
<h4>Incoming WebSocket data</h4>
<ul id="events"></ul>
<script>
  let ws
  async function websocket(url) {
    ws = new WebSocket(url)
    if (!ws) {
      throw new Error("server didn't accept ws")
    }
    ws.addEventListener("open", () => {
      console.log('Opened websocket')
      updateCount(0)
    })
    ws.addEventListener("message", ({ data }) => {
      const { count, tz, error } = JSON.parse(data)
      addNewEvent(data)
      if (error) {
        setErrorMessage(error)
      } else {
        setErrorMessage()
        updateCount(count)
      }
    })
    ws.addEventListener("close", () => {
      console.log('Closed websocket')
      const list = document.querySelector("#events")
      updateCount(0)
      addNewEvent(0)
      list.innerText = ""
      setErrorMessage()
    })
  }
  const url = new URL(window.location)
  url.protocol = "ws" 
  url.pathname = "/ws"
  websocket(url)
  document.querySelector("#click").addEventListener("click", () => {
    ws.send("CLICK")
  })
  const updateCount = (count) => {
    document.querySelector("#num").innerText = count
  }
  const addNewEvent = (data) => {
    const list = document.querySelector("#events")
    const item = document.createElement("li")
    item.innerText = data
    list.prepend(item)
  }
  const closeConnection = () => ws.close()
  document.querySelector("#close").addEventListener("click", closeConnection)
  document.querySelector("#unknown").addEventListener("click", () => ws.send("HUH"))
  const setErrorMessage = message => {
    document.querySelector("#error").innerHTML = message ? message : ""
  }
</script>
`;

export default () => {
  return new Response(template, {
    headers: {
      "Content-type": "text/html; charset=utf-8",
    },
  });
};
