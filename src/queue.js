const Queue = require("bull");

const taskQueue = new Queue("bot tasks", process.env.REDIS_URL);

taskQueue.process(async (job) => {
  switch (job.data.type) {
    case "claimFarmReward":
      await claimFarmReward(job.data.token);
      break;
    case "startFarmingSession":
      await startFarmingSession(job.data.token);
      break;
    // Tambahkan case lain untuk tugas-tugas lainnya
  }
});

module.exports = { taskQueue };
