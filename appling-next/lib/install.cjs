const Thread = require("bare-thread");
const { App, Screen, Window, WebView } = require("fx-native");
const appling = require("appling-native");
const { encode, decode } = require("./utils");
const { preflight } = require("./preflight");
const html = require("./view.html");

const WINDOW_HEIGHT = 548;
const WINDOW_WIDTH = 500;

async function install(id, opts = {}) {
  const { platform = "pzcjqmpoo6szkoc4bpkw65ib9ctnrq7b6mneeinbhbheihaq6p6o" } =
    opts;

  console.log("[install] called with id:", id, "opts:", opts);

  using lock = await preflight(id);
  console.log(
    "[install] preflight lock acquired for id:",
    id,
    "lock.dir:",
    lock.dir,
  );

  const config = {
    dir: lock.dir,
    platform,
    link: `pear://${id}`,
  };

  console.log("[install] config prepared:", config);

  const app = App.shared();

  let window;
  let view;

  function onViewMessage(message) {
    const msg = message.toString();
    console.log("[onViewMessage] Received message:", msg);
    switch (msg) {
      case "quit":
        console.log("[onViewMessage] Handling quit");
        window.close();
        break;
      case "install":
        console.log("[onViewMessage] Handling install");
        app.broadcast(encode({ type: "install" }));
        break;
      case "launch": {
        console.log("[onViewMessage] Handling launch");
        lock.unlock();
        const appInstance = new appling.App(id);
        console.log("[onViewMessage] Created appling.App instance and opening");
        appInstance.open();
        window.close();
        break;
      }
      default:
        console.log("[onViewMessage] Unknown message:", msg);
    }
  }

  function onWorkerMessage(message) {
    const msg = decode(message);
    console.log("[onWorkerMessage] Received message:", msg);
    switch (msg.type) {
      case "ready":
        console.log("[onWorkerMessage] Worker is ready. Broadcasting config.");
        app.broadcast(encode({ type: "config", data: config }));
        break;
      case "download":
        console.log("[onWorkerMessage] Download progress:", msg.data);
        view.postMessage({ type: "progress", data: msg.data });
        break;
      case "complete":
        console.log("[onWorkerMessage] Installation complete.");
        view.postMessage({ type: "state", state: "complete" });
        break;
      case "error":
        console.log("[onWorkerMessage] Error occurred:", msg);
        view.postMessage({ type: "state", state: "error" });
        break;
      default:
        console.log("[onWorkerMessage] Unknown message type:", msg.type);
    }
  }

  app
    .on("launch", () => {
      console.log("[app.launch] Launch event triggered.");
      new Thread(require.resolve("./worker"));
      console.log("[app.launch] Worker thread started.");

      const { width, height } = Screen.main().getBounds();
      console.log("[app.launch] Screen bounds:", { width, height });

      window = new Window(
        (width - WINDOW_WIDTH) / 2,
        (height - WINDOW_HEIGHT) / 2,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        { frame: false },
      );
      console.log("[app.launch] Window created.");

      view = new WebView(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
      view.on("message", onViewMessage).loadHTML(html);
      console.log("[app.launch] WebView created and HTML loaded.");

      window.appendChild(view);
      window.show();
      console.log("[app.launch] Window shown.");
    })
    .on("terminate", () => {
      console.log("[app.terminate] Terminate event triggered.");
      if (window) {
        window.destroy();
        console.log("[app.terminate] Window destroyed.");
      }
    })
    .on("message", onWorkerMessage)
    .run();
}

module.exports = { install };
