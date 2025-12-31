const { App } = require("fx-native");
const bootstrap = require("pear-updater-bootstrap");
const appling = require("appling-native");
const { encode, decode, format } = require("./utils");
const { Progress } = require("./progress");

const app = App.shared();

let config;
let platform;

function setup(data) {
  console.log("[worker] setup() called with data:", data);
  config = data;
}

async function install() {
  console.log("[worker] install() called");
  const progress = new Progress(app, [0.3, 0.7]);
  let platformFound = false;
  let bootstrapInterval = null;

  try {
    try {
      console.log("[worker] Resolving platform at dir:", config.dir);
      platform = await appling.resolve(config.dir);
      platformFound = true;
      console.log("[worker] Platform found:", !!platform);
    } catch (e) {
      console.log(
        "[worker] Platform not found or resolve failed. Bootstrapping with:",
        config.platform,
        config.dir,
      );
      await bootstrap(config.platform, config.dir, {
        lock: false,
        onupdater: (u) => {
          bootstrapInterval = setInterval(() => {
            console.log("[worker] Bootstrap progress:", u.downloadProgress);
            progress.update(format(u));
            if (u.downloadProgress === 1) {
              console.log(
                "[worker] Bootstrap download complete. Clearing interval.",
              );
              clearInterval(bootstrapInterval);
            }
          }, 250);
        },
      });
      console.log(
        "[worker] Bootstrap finished. Resolving platform again.",
        config.dir,
      );
      platform = await appling.resolve(config.dir);
      console.log("[worker] Platform resolved after bootstrap:", !!platform);
    }
    if (platformFound) {
      console.log(
        "[worker] Platform found on first try, moving to next stage.",
      );
      progress.stage(0, 1);
    }
    console.log("[worker] Sending initial progress update.");
    progress.update({ progress: 0, speed: "", peers: 0, bytes: 0 }, 1);
    console.log("[worker] Running platform.preflight with link:", config.link);
    await platform.preflight(config.link, (u) => {
      console.log("[worker] Preflight progress update:", u);
      progress.update(format(u), 1); // stage = 1
    });
    console.log("[worker] Preflight complete.");
    progress.complete();
    console.log("[worker] Installation complete. Broadcasting 'complete'.");
    app.broadcast(encode({ type: "complete" }));
  } catch (e) {
    console.error("[worker] Bootstrap error: %o", e);
    app.broadcast(encode({ type: "error", error: e.message }));
  } finally {
    if (bootstrapInterval) {
      console.log("[worker] Clearing bootstrapInterval in finally block.");
      clearInterval(bootstrapInterval);
    }
  }
}

app.on("message", async (message) => {
  console.log("[worker] Message received:", message);
  const msg = decode(message);
  console.log("[worker] Decoded message:", msg);
  switch (msg.type) {
    case "config":
      console.log("[worker] Handling 'config' message");
      setup(msg.data);
      break;
    case "install":
      console.log("[worker] Handling 'install' message");
      await install();
      break;
    default:
      console.log("[worker] Unknown message type:", msg.type);
      break;
  }
});

console.log("[worker] Broadcasting 'ready' message.");
app.broadcast(encode({ type: "ready" }));
