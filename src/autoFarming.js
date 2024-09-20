const { claimFarmReward, startFarmingSession, getBalance } = require("./api");
const { delay } = require("./utils");

async function runAutoFarming(accountNumber) {
  while (true) {
    try {
      console.log(
        `🔄 Memulai sesi auto farming untuk akun ${accountNumber}...`.yellow
      );

      const claimResult = await claimFarmReward(accountNumber);
      if (claimResult) {
        console.log(
          `🌾 Reward farming telah diklaim untuk akun ${accountNumber}!`.green
        );
      } else {
        console.log(
          `⏳ Belum waktunya untuk klaim reward farming untuk akun ${accountNumber}.`
            .yellow
        );
      }

      const farmingSession = await startFarmingSession(accountNumber);
      console.log(
        `🚜 Sesi farming baru dimulai untuk akun ${accountNumber}!`.green
      );

      // Tambahkan logging untuk memeriksa respons dari getBalance
      console.log("Mencoba mendapatkan saldo...");
      const balance = await getBalance(accountNumber);
      console.log("Respons getBalance:", JSON.stringify(balance, null, 2));

      if (balance && balance.farming && balance.farming.balance !== undefined) {
        console.log(
          `🌾 Saldo farming saat ini untuk akun ${accountNumber}: ${balance.farming.balance} BLUM`
            .green
        );
      } else {
        console.log(
          `⚠️ Tidak dapat membaca saldo farming untuk akun ${accountNumber}. Melanjutkan...`
            .yellow
        );
      }

      console.log(`⏳ Menunggu 10 jam sebelum siklus berikutnya...`.cyan);
      await delay(10 * 60 * 60 * 1000); // Tunggu 10 jam
    } catch (error) {
      console.error(
        `❌ Gagal menjalankan auto farming untuk akun ${accountNumber}:`.red,
        error.message
      );
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      console.log(`⏳ Menunggu 5 menit sebelum mencoba lagi...`.yellow);
      await delay(5 * 60 * 1000); // Tunggu 5 menit sebelum mencoba lagi
    }
  }
}

module.exports = { runAutoFarming };
