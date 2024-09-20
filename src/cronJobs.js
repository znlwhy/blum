// const cron = require("cron");
// const {
//   getBalance,
//   claimDailyReward,
//   claimFarmReward,
//   startFarmingSession,
// } = require("./api");

// function setupCronJob(token) {
//   const job = new cron.CronJob("0 */12 * * *", async () => {
//     try {
//       console.log("🔄 Memulai sesi farming setiap 12 jam...".yellow);
//       await claimFarmReward(token);
//       console.log("🌾 Reward farming telah diklaim!".green);
//     } catch (error) {
//       console.error("❌ Gagal mengklaim reward farming:".red, error.message);
//     }
//   });
//   job.start();
//   console.log("⏰ Cron job diatur untuk berjalan setiap 12 jam.".green);
// }

// function setupBalanceCheckJob(token) {
//   const randomHour = Math.floor(Math.random() * 8) + 1;
//   const cronPattern = `0 */${randomHour} * * *`;

//   const job = new cron.CronJob(cronPattern, async () => {
//     const balance = await getBalance(token);
//     console.log(
//       `🌾 Updated farming balance: ${balance.farming.balance} BLUM`.green
//     );
//   });

//   job.start();
//   console.log(
//     `⏰ Balance check job set up to run every ${randomHour} hours.`.green
//   );
// }

// function setupFarmRewardCron(token) {
//   const job = new cron.CronJob("0 */9 * * *", async () => {
//     console.log("⏰ Running farm reward cron job...".yellow);
//     const reward = await claimFarmReward(token);

//     if (reward) {
//       console.log("✅ Farm reward claimed successfully!".green);
//     }
//   });
//   job.start();

//   console.log("🕒 Daily reward cron job scheduled to run every 9 hours.".green);
// }

// function setupDailyRewardCron(token) {
//   const job = new cron.CronJob("0 0 * * *", async () => {
//     console.log("⏰ Running daily reward cron job...".yellow);
//     const reward = await claimDailyReward(token);

//     if (reward) {
//       console.log("✅ Daily reward claimed successfully!".green);
//     }
//   });
//   job.start();

//   console.log(
//     "🕒 Daily reward cron job scheduled to run every 24 hours.".green
//   );
// }

// function setupAutoFarmingJob(token, accountNumber = 1) {
//   const job = new cron.CronJob("0 */10 * * *", async () => {
//     try {
//       console.log(
//         `🔄 Memulai sesi auto farming untuk akun ${accountNumber} setiap 10 jam...`
//           .yellow
//       );

//       const claimResult = await claimFarmReward(token, accountNumber);
//       // ... (kode lainnya)

//       const farmingSession = await startFarmingSession(token, accountNumber);
//       // ... (kode lainnya)

//       const balance = await getBalance(token, accountNumber);
//       // ... (kode lainnya)
//     } catch (error) {
//       console.error(
//         `❌ Gagal menjalankan auto farming untuk akun ${accountNumber}:`.red,
//         error.message
//       );
//     }
//   });
//   job.start();
//   console.log(
//     `⏰ Auto farming job diatur untuk berjalan setiap 10 jam untuk akun ${accountNumber}.`
//       .green
//   );
// }

// module.exports = {
//   setupCronJob,
//   setupBalanceCheckJob,
//   setupDailyRewardCron,
//   setupFarmRewardCron,
//   setupAutoFarmingJob, // Tambahkan ini
// };
