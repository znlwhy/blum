require("dotenv").config();
require("colors");
const readlineSync = require("readline-sync");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const {
  getUsername,
  getBalance,
  getTribe,
  claimFarmReward,
  startFarmingSession,
  getTasks,
  claimTaskReward,
  getGameId,
  claimGamePoints,
  startTask,
  claimDailyReward,
  // Hapus setupRefreshToken dari sini
} = require("./src/api.js");
const { delay } = require("./src/utils");
const { displayHeader } = require("./src/display");
const { runAutoFarming } = require("./src/autoFarming");

const TOKEN_FILE_PATH = path.join(__dirname, "accessToken.txt");

const handleDefaultFlow = async () => {
  try {
    const featureChoice = readlineSync.question(
      "Which feature would you like to use?\n1. Claim Farm Reward 🌾\n2. Start Farming Session 🚜\n3. Auto Complete Tasks ✅\n4. Auto Play and Claim Game Points 🎮\n5. Claim Daily Reward ✨\n6. Auto Farming (Claim & Start every 10 hours) 🔄\nChoose 1, 2, 3, 4, 5, or 6: "
    );

    if (featureChoice === "1") {
      console.log("🌾 Claiming farm reward...".yellow);
      const claimResponse = await claimFarmReward(1);

      if (claimResponse) {
        console.log("✅ Farm reward claimed successfully!".green);
      }

      const runAgain = readlineSync.question(
        "Do you want to run this farm reward claim every 9 hours? (yes/no): "
      );

      if (runAgain.toLowerCase() === "yes") {
        setupFarmRewardCron(1);
      } else {
        console.log("👋 Exiting the bot. See you next time!".cyan);
        process.exit(0);
      }
    } else if (featureChoice === "2") {
      console.log("🚜 Starting farming session...".yellow);
      console.log("");

      const farmingSession = await startFarmingSession(1);
      const farmStartTime = moment(farmingSession.startTime).format(
        "MMMM Do YYYY, h:mm:ss A"
      );
      const farmEndTime = moment(farmingSession.endTime).format(
        "MMMM Do YYYY, h:mm:ss A"
      );

      console.log(`✅ Farming session started!`.green);
      console.log(`⏰ Start time: ${farmStartTime}`);
      console.log(`⏳ End time: ${farmEndTime}`);

      const balance = await getBalance(1);

      if (balance) {
        console.log(
          `🌾 Updated farming balance: ${balance.farming.balance} BLUM`.green
        );
      }

      setupCronJob(1);
      setupBalanceCheckJob(1);
    } else if (featureChoice === "3") {
      console.log("✅ Auto completing tasks...".yellow);
      console.log("");

      const tasksData = await getTasks(1);

      tasksData.forEach(async (category) => {
        if (
          category.tasks &&
          category.tasks.length > 0 &&
          category.tasks[0].subTasks
        ) {
          for (const task of category.tasks[0].subTasks) {
            if (task.status === "FINISHED") {
              console.log(
                `⏭️  Task "${task.title}" is already completed.`.cyan
              );
            } else if (task.status === "NOT_STARTED") {
              console.log(
                `⏳ Task "${task.title}" is not started yet. Starting now...`
                  .red
              );

              const startedTask = await startTask(task.id, task.title, 1);

              if (startedTask) {
                console.log(
                  `✅ Task "${startedTask.title}" has been started!`.green
                );

                console.log(
                  `⏳ Claiming reward for "${task.title}" is starting now...`
                    .red
                );

                try {
                  const claimedTask = await claimTaskReward(task.id, 1);
                  console.log(
                    `✅ Task "${claimedTask.title}" has been claimed!`.green
                  );
                  console.log(`🎁 Reward: ${claimedTask.reward}`.green);
                } catch (error) {
                  console.log(
                    `🚫 Unable to claim task "${task.title}", please try to claim it manually.`
                      .red
                  );
                }
              }
            } else if (
              task.status === "STARTED" ||
              task.status === "READY_FOR_CLAIM"
            ) {
              try {
                const claimedTask = await claimTaskReward(task.id, 1);

                console.log(
                  `✅ Task "${claimedTask.title}" has been claimed!`.green
                );
                console.log(`🎁 Reward: ${claimedTask.reward}`.green);
              } catch (error) {
                console.log(`🚫 Unable to claim task "${task.title}".`.red);
              }
            }
          }
        }

        if (
          category.subSections &&
          category.subSections.length > 0 &&
          category.subSections[0].tasks
        ) {
          for (const fetchedTasks of category.subSections) {
            for (const task of fetchedTasks.tasks) {
              if (task.status === "FINISHED") {
                console.log(
                  `⏭️  Task "${task.title}" is already completed.`.cyan
                );
              } else if (task.status === "NOT_STARTED") {
                console.log(
                  `⏳ Task "${task.title}" is not started yet. Starting now...`
                    .red
                );

                const startedTask = await startTask(task.id, task.title, 1);

                if (startedTask) {
                  console.log(
                    `✅ Task "${startedTask.title}" has been started!`.green
                  );

                  console.log(
                    `⏳ Claiming reward for "${task.title}" is starting now...`
                      .red
                  );

                  try {
                    const claimedTask = await claimTaskReward(task.id, 1);
                    console.log(
                      `✅ Task "${claimedTask.title}" has been claimed!`.green
                    );
                    console.log(`🎁 Reward: ${claimedTask.reward}`.green);
                  } catch (error) {
                    console.log(
                      `🚫 Unable to claim task "${task.title}", please try to claim it manually.`
                        .red
                    );
                  }
                }
              } else if (
                task.status === "STARTED" ||
                task.status === "READY_FOR_CLAIM"
              ) {
                try {
                  const claimedTask = await claimTaskReward(task.id, 1);

                  console.log(
                    `✅ Task "${claimedTask.title}" has been claimed!`.green
                  );
                  console.log(`🎁 Reward: ${claimedTask.reward}`.green);
                } catch (error) {
                  console.log(`🚫 Unable to claim task "${task.title}".`.red);
                }
              }
            }
          }
        }
      });
    } else if (featureChoice === "4") {
      console.log("🎮 Auto playing game and claiming reward...".yellow);

      const balance = await getBalance(1);

      if (balance.playPasses > 0) {
        let counter = balance.playPasses;
        while (counter > 0) {
          const gameData = await getGameId(1);

          console.log("⌛ Please wait for 1 minute to play the game...".yellow);
          await delay(60000);

          const randPoints = Math.floor(Math.random() * (240 - 160 + 1)) + 160;
          const letsPlay = await claimGamePoints(
            gameData.gameId,
            randPoints,
            1
          );

          if (letsPlay === "OK") {
            const balance = await getBalance(1);
            if (balance) {
              console.log(
                `🎮 Play game success! Your balance now: ${balance.availableBalance} BLUM`
                  .green
              );
            } else {
              console.log(` Play game success!`.green);
            }
          }
          counter--;
        }
      } else {
        console.log(
          `🚫 You can't play again because you have ${balance.playPasses} chance(s) left.`
            .red
        );
      }
    } else if (featureChoice === "5") {
      const reward = await claimDailyReward(1);

      if (reward) {
        console.log("✅ Daily reward claimed successfully!".green);
      }

      const runAgain = readlineSync.question(
        "Do you want to run this daily reward claim every 24 hours? (yes/no): "
      );

      if (runAgain.toLowerCase() === "yes") {
        setupDailyRewardCron(1);
      } else {
        console.log("👋 Exiting the bot. See you next time!".cyan);
        process.exit(0);
      }
    } else if (featureChoice === "6") {
      console.log("🔄 Memulai auto farming...".yellow);
      console.log(
        "Auto farming akan berjalan setiap 10 jam. Tekan Ctrl+C untuk menghentikan."
          .cyan
      );
      await runAutoFarming(1);
    } else {
      console.log(
        "🚫 Invalid choice! Please restart the program and choose a valid option."
          .red
      );
    }
  } catch (error) {
    handleApiError(error);
  }
};

const handleApiError = async (error) => {
  if (error.message.includes("Token for account")) {
    console.error(
      `🚨 ${error.message}. Please update the BEARER_TOKEN in .env file.`.red
    );
  } else if (error.response && error.response.data) {
    console.error(
      `🚨 An unexpected error occurred: ${error.response.data.message}`.red
    );
  } else {
    console.error(`🚨 An unexpected error occurred: ${error.message}`.red);
  }
};

const runScript = async () => {
  displayHeader();

  try {
    const username = await getUsername(1);
    const balance = await getBalance(1);
    const tribe = await getTribe(1);

    console.log(`👋 Halo, ${username}!`.green);
    console.log(
      `💰 Saldo BLUM Anda saat ini: ${balance.availableBalance}`.green
    );
    console.log(`🎮 Kesempatan Anda untuk bermain game: ${balance.playPasses}`);
    console.log("");
    console.log("🏰 Detail suku Anda:");
    if (tribe) {
      console.log(`   - Nama: ${tribe.title}`);
      console.log(`   - Anggota: ${tribe.countMembers}`);
      console.log(`   - Saldo Penghasilan: ${tribe.earnBalance}`);
      console.log(`   - Peran Anda: ${tribe.role}`);
      console.log("");
    } else {
      console.error("🚨 Suku tidak ditemukan!".red);
      console.log(
        `Bergabunglah dengan Suku HCA di sini: https://t.me/HappyCuanAirdrop/19694\n`
          .blue
      );
    }

    await handleDefaultFlow();
  } catch (error) {
    console.error(
      "❌ Terjadi kesalahan saat menjalankan skrip:".red,
      error.message
    );
    process.exit(1);
  }
};

async function initializeApp() {
  try {
    // Hapus pemanggilan setupRefreshToken
    console.log("Inisialisasi aplikasi berhasil.".green);
  } catch (error) {
    console.error("Gagal menginisialisasi aplikasi:".red, error.message);
    process.exit(1);
  }
}

console.log("BEARER_TOKEN_1:", process.env.BEARER_TOKEN_1);

initializeApp().then(() => {
  runScript();
});
