const { EventEmitter } = require("events");

class BotState extends EventEmitter {
  constructor() {
    super();
    this.state = {
      farmingSession: null,
      lastClaimTime: null,
      taskProgress: {},
    };
  }

  updateFarmingSession(session) {
    this.state.farmingSession = session;
    this.emit("farmingSessionUpdated", session);
  }

  updateLastClaimTime() {
    this.state.lastClaimTime = Date.now();
    this.emit("lastClaimTimeUpdated", this.state.lastClaimTime);
  }

  updateTaskProgress(taskId, progress) {
    this.state.taskProgress[taskId] = progress;
    this.emit("taskProgressUpdated", { taskId, progress });
  }
}

module.exports = new BotState();
