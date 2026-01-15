const { App } = require("fx-native");
const bootstrap = require("pear-updater-bootstrap");
const appling = require("appling-native");
const { encode, decode, format } = require("./utils");
const { Progress } = require("./progress");

const app = App.shared();

let config;
let platform;
let installing = false; // Guard against concurrent installation

function setup(data) {
  config = data;
}

/**
 * Validates that config has all required fields.
 * @returns {string|null} Error message if invalid, null if valid
 */
function validateConfig() {
  if (!config) {
    return "Configuration not received - setup() was not called";
  }
  if (!config.dir) {
    return "Configuration missing required 'dir' field";
  }
  if (!config.platform) {
    return "Configuration missing required 'platform' field";
  }
  if (!config.link) {
    return "Configuration missing required 'link' field";
  }
  return null;
}

async function install() {
  // Prevent concurrent installation attempts
  if (installing) {
    return;
  }

  // Validate configuration before proceeding
  const configError = validateConfig();
  if (configError) {
    console.error("[worker] Configuration error:", configError);
    app.broadcast(encode({ type: "error", error: configError }));
    return;
  }

  installing = true;
  const progress = new Progress(app, [0.3, 0.7]);
  let platformFound = false;
  let bootstrapInterval = null;

  try {
    try {
      platform = await appling.resolve(config.dir);
      platformFound = true;
    } catch (e) {
      // Platform not found - bootstrap it
      await bootstrap(config.platform, config.dir, {
        lock: false,
        onupdater: (u) => {
          bootstrapInterval = setInterval(() => {
            progress.update(format(u));
            if (u.downloadProgress === 1) {
              clearInterval(bootstrapInterval);
            }
          }, 250);
        },
      });
      platform = await appling.resolve(config.dir);
    }

    if (platformFound) {
      progress.stage(0, 1);
    }

    progress.update({ progress: 0, speed: "", peers: 0, bytes: 0 }, 1);

    await platform.preflight(config.link, (u) => {
      progress.update(format(u), 1);
    });

    progress.complete();
    app.broadcast(encode({ type: "complete" }));
  } catch (e) {
    console.error("[worker] Installation error:", e.message);
    app.broadcast(encode({ type: "error", error: e.message }));
  } finally {
    // Always reset installing flag to allow retry
    installing = false;
    if (bootstrapInterval) {
      clearInterval(bootstrapInterval);
    }
  }
}

app.on("message", async (message) => {
  const msg = decode(message);

  // Handle decode failure (malformed JSON)
  if (!msg) {
    return;
  }

  switch (msg.type) {
    case "config":
      setup(msg.data);
      break;
    case "install":
      await install();
      break;
  }
});

app.broadcast(encode({ type: "ready" }));
