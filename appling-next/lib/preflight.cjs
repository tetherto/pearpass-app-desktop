const appling = require("appling-native");

async function preflight(id, dir) {
  console.log("[preflight] called with id:", id, "dir:", dir);

  const lock = await appling.lock(dir);
  console.log("[preflight] lock acquired for dir:", dir);

  let platform;
  try {
    platform = await appling.resolve(dir);
    console.log("[preflight] resolved platform for dir:", dir);
  } catch (err) {
    console.log(
      "[preflight] failed to resolve platform for dir:",
      dir,
      "Error:",
      err,
    );
    return lock;
  }

  const ready = platform.ready(`pear://${id}`);
  console.log(
    "[preflight] platform.ready for pear://",
    id,
    ":",
    ready,
    "dir:",
    platform.path,
  );

  if (ready === false) {
    console.log("[preflight] platform not ready for launch, returning lock.");
    return lock;
  }

  console.log("[preflight] unlocking lock for dir:", dir);
  await lock.unlock();

  console.log("[preflight] launching platform with id:", id);
  platform.launch(id);

  console.log("[preflight] exiting Bare process");
  Bare.exit();
}

module.exports = { preflight };
