const prettyBytes = require("prettier-bytes");
const { encode } = require("./utils");

class Progress {
  constructor(app, stages = [1]) {
    this.app = app;
    this.stages = stages; // e.g. [0.5, 0.3, 0.2]
    this.values = Array(stages.length).fill(0);
    this.speed = "";
    this.peers = 0;
    this.total = 0;
    this.currentStage = 0;
    this.stageBytes = Array(stages.length).fill(0);
  }

  _broadcast() {
    const bytes = this.stageBytes.reduce((sum, b) => sum + b, 0);
    this.app.broadcast(
      encode({
        type: "download",
        data: {
          speed: this.speed,
          peers: this.peers,
          progress: this.total,
          stage: this.currentStage,
          bytes: prettyBytes(bytes),
        },
      }),
    );
  }

  _compute() {
    const v = this.stages.reduce(
      (sum, per, i) => sum + per * this.values[i],
      0,
    );
    this.total = Math.round(v * 100);
  }

  update(u, stage = 0) {
    if (u.speed !== undefined) this.speed = u.speed;
    if (u.peers !== undefined) this.peers = u.peers;
    if (u.bytes !== undefined) this.stageBytes[stage] = u.bytes;
    if (u.progress !== undefined) this.stage(stage, u.progress);
  }

  stage(stage, value) {
    if (stage < 0 || stage >= this.values.length) return;
    this.currentStage = stage;
    this.values[stage] = Math.min(1, Math.max(0, value));
    this._compute();
    this._broadcast();
  }

  complete() {
    this.values = this.values.map(() => 1);
    this._compute();
    this._broadcast();
  }
}

module.exports = { Progress };
