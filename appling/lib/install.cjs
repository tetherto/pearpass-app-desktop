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

  // Preflight check - determines if installation is needed
  const preflightResult = await preflight(id);

  // If app was already installed and launched, exit immediately
  if (preflightResult.launched) {
    Bare.exit();
    return;
  }

  // Use the lock with explicit resource management
  using lock = preflightResult.lock;

  const config = {
    dir: lock.dir,
    platform,
    link: `pear://${id}`,
  };

  const app = App.shared();

  let window;
  let view;

  function onViewMessage(message) {
    const msg = message.toString();
    switch (msg) {
      case "quit":
        window.close();
        break;
      case "install":
        app.broadcast(encode({ type: "install" }));
        break;
      case "launch": {
        lock.unlock();
        const appInstance = new appling.App(id);
        appInstance.open();
        window.close();
        break;
      }
    }
  }

  function onWorkerMessage(message) {
    const msg = decode(message);
    if (!msg) return;

    switch (msg.type) {
      case "ready":
        app.broadcast(encode({ type: "config", data: config }));
        break;
      case "download":
        view.postMessage({ type: "progress", data: msg.data });
        break;
      case "complete":
        view.postMessage({ type: "state", state: "complete" });
        break;
      case "error":
        console.error("[install] Worker error:", msg.error);
        view.postMessage({ type: "state", state: "error" });
        break;
    }
  }

  // Track worker thread for cleanup
  let workerThread;

  app
    .on("launch", () => {
      workerThread = new Thread(require.resolve("./worker"));

      const { width, height } = Screen.main().getBounds();

      window = new Window(
        (width - WINDOW_WIDTH) / 2,
        (height - WINDOW_HEIGHT) / 2,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        { frame: false },
      );

      view = new WebView(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
      view.on("message", onViewMessage).loadHTML(html);

      window.appendChild(view);
      window.show();
    })
    .on("terminate", () => {
      // Terminate worker thread if it exists
      if (workerThread) {
        try {
          workerThread.terminate();
        } catch (err) {
          // Ignore termination errors
        }
      }
      if (window) {
        window.destroy();
      }
    })
    .on("message", onWorkerMessage)
    .run();
}

module.exports = { install };
