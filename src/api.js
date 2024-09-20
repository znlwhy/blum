const axios = require("axios");
const NodeCache = require("node-cache");
const util = require("util");
const fs = require("fs").promises;
const path = require("path");

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 detik

const cache = new NodeCache({ stdTTL: 3600 }); // Cache selama 1 jam

const axiosInstance = axios.create({
  timeout: 30000, // 30 detik
});

// Fungsi untuk mendapatkan token dari .env atau cache
async function getToken(accountNumber = 1) {
  let token = cache.get(`access_token_${accountNumber}`);
  if (!token) {
    token = process.env[`BEARER_TOKEN_${accountNumber}`];
    if (!token) {
      throw new Error(
        `BEARER_TOKEN_${accountNumber} tidak ditemukan dalam variabel lingkungan`
      );
    }
    cache.set(`access_token_${accountNumber}`, token);
  }
  return `Bearer ${token}`;
}

// Hapus fungsi login karena kita tidak menggunakannya

// Tambahkan fungsi ini di bagian atas file
async function updateToken(accountNumber, newToken) {
  const envPath = path.resolve(__dirname, "..", ".env");
  let envContent = await fs.readFile(envPath, "utf8");
  const tokenKey = `BEARER_TOKEN_${accountNumber}`;
  const regex = new RegExp(`${tokenKey}=.*`);
  envContent = envContent.replace(regex, `${tokenKey}=${newToken}`);
  await fs.writeFile(envPath, envContent);
  process.env[tokenKey] = newToken;
  console.log(`Token untuk akun ${accountNumber} telah diperbarui.`.green);
}

// Ubah fungsi makeAuthorizedRequest
async function makeAuthorizedRequest(url, method, data = null, accountNumber) {
  try {
    let token = await getToken(accountNumber);
    const response = await axios({
      url,
      method,
      headers: { Authorization: token },
      data,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(
        `Token untuk akun ${accountNumber} kedaluwarsa. Silakan perbarui token di file .env`
          .red
      );
      process.exit(1);
    }
    throw error;
  }
}

// Tambahkan fungsi ini
function promptForNewToken(accountNumber) {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      `Masukkan token baru untuk akun ${accountNumber}: `,
      (token) => {
        readline.close();
        resolve(token);
      }
    );
  });
}

// Perbarui semua fungsi API untuk menerima parameter accountNumber
async function getUsername(accountNumber) {
  return makeAuthorizedRequest(
    "https://user-domain.blum.codes/api/v1/user/me",
    "GET",
    null,
    accountNumber
  );
}

// Lakukan hal yang sama untuk fungsi lainnya: getBalance, getTribe, claimFarmReward, dll.
// Contoh:
async function getBalance(accountNumber) {
  try {
    const response = await makeAuthorizedRequest(
      "https://game-domain.blum.codes/api/v1/user/balance",
      "GET",
      null,
      accountNumber
    );
    console.log("Respons getBalance:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error(
      `Gagal mendapatkan saldo untuk akun ${accountNumber}:`,
      error.message
    );
    throw error;
  }
}

async function getTribe() {
  try {
    return await makeAuthorizedRequest(
      "https://tribe-domain.blum.codes/api/v1/tribe/my",
      "GET"
    );
  } catch (error) {
    if (error.response && error.response.data.message === "NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

async function claimFarmReward() {
  try {
    return await makeAuthorizedRequest(
      "https://game-domain.blum.codes/api/v1/farming/claim",
      "POST"
    );
  } catch (error) {
    if (error.response) {
      console.error(`🚨 Claim failed! ${error.response.data.message}`.red);
    } else {
      console.error(`🚨 Error occurred from farm claim: ${error}`.red);
    }
    return null;
  }
}

async function claimDailyReward() {
  try {
    return await makeAuthorizedRequest(
      "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
      "POST"
    );
  } catch (error) {
    if (error.response && error.response.data.message === "same day") {
      console.error(
        `🚨 Daily claim failed because you already claimed today.`.red
      );
    } else {
      console.error(`🚨 Error occurred from daily claim: ${error}`.red);
    }
    return null;
  }
}

async function startFarmingSession() {
  return makeAuthorizedRequest(
    "https://game-domain.blum.codes/api/v1/farming/start",
    "POST"
  );
}

async function getTasks() {
  return makeAuthorizedRequest(
    "https://earn-domain.blum.codes/api/v1/tasks",
    "GET"
  );
}

async function startTask(taskId) {
  try {
    return await makeAuthorizedRequest(
      `https://earn-domain.blum.codes/api/v1/tasks/${taskId}/start`,
      "POST"
    );
  } catch (error) {
    if (
      error.response &&
      error.response.data.message === "Task type does not support start"
    ) {
      console.error(
        `🚨 Start task failed, because the task does not support starting.`.red
      );
    } else {
      console.error(
        `🚨 Error starting task: ${error.response ? error.response.data.message : error}`
          .red
      );
    }
    return null;
  }
}

async function claimTaskReward(taskId) {
  return makeAuthorizedRequest(
    `https://earn-domain.blum.codes/api/v1/tasks/${taskId}/claim`,
    "POST"
  );
}

async function getGameId() {
  return makeAuthorizedRequest(
    "https://game-domain.blum.codes/api/v1/game/play",
    "POST"
  );
}

async function claimGamePoints(gameId, points) {
  return makeAuthorizedRequest(
    `https://game-domain.blum.codes/api/v1/game/claim`,
    "POST",
    { gameId, points }
  );
}

// Hapus fungsi refresh token dan login
// async function refreshToken(accountNumber) {
//   try {
//     const response = await axios.post(
//       "https://auth-domain.blum.codes/api/v1/auth/refresh",
//       {
//         refreshToken: process.env[`REFRESH_TOKEN_${accountNumber}`],
//       }
//     );
//     const newToken = response.data.accessToken;
//     await updateToken(accountNumber, newToken);
//     return newToken;
//   } catch (error) {
//     console.error(
//       `Gagal refresh token untuk akun ${accountNumber}:`,
//       error.message
//     );
//     throw error;
//   }
// }

// async function login(accountNumber) {
//   try {
//     const response = await axios.post(
//       "https://auth-domain.blum.codes/api/v1/auth/login",
//       {
//         username: process.env[`USERNAME_${accountNumber}`],
//         password: process.env[`PASSWORD_${accountNumber}`],
//       }
//     );
//     const newToken = response.data.accessToken;
//     await updateToken(accountNumber, newToken);
//     return newToken;
//   } catch (error) {
//     console.error(`Gagal login untuk akun ${accountNumber}:`, error.message);
//     throw error;
//   }
// }

// Fungsi untuk mendapatkan refresh token
// async function getRefreshToken(username, password) {
//   try {
//     const response = await axios.post(
//       "https://auth-domain.blum.codes/api/v1/auth/login",
//       {
//         username: username,
//         password: password,
//       }
//     );

//     if (response.data && response.data.refreshToken) {
//       console.log("Refresh token berhasil didapatkan.");
//       return response.data.refreshToken;
//     } else {
//       throw new Error("Refresh token tidak ditemukan dalam respons.");
//     }
//   } catch (error) {
//     console.error("Gagal mendapatkan refresh token:", error.message);
//     throw error;
//   }
// }

// Fungsi untuk menyimpan refresh token ke file .env
// async function saveRefreshToken(accountNumber, refreshToken) {
//   const envPath = path.resolve(__dirname, "..", ".env");
//   let envContent = await fs.readFile(envPath, "utf8");
//   const tokenKey = `REFRESH_TOKEN_${accountNumber}`;

//   if (envContent.includes(tokenKey)) {
//     // Update existing refresh token
//     const regex = new RegExp(`${tokenKey}=.*`);
//     envContent = envContent.replace(regex, `${tokenKey}=${refreshToken}`);
//   } else {
//     // Add new refresh token
//     envContent += `\n${tokenKey}=${refreshToken}`;
//   }

//   await fs.writeFile(envPath, envContent);
//   console.log(
//     `Refresh token untuk akun ${accountNumber} telah disimpan.`.green
//   );
// }

// Fungsi untuk mengatur refresh token
// async function setupRefreshToken(accountNumber) {
//   const username = process.env[`USERNAME_${accountNumber}`];
//   const password = process.env[`PASSWORD_${accountNumber}`];

//   if (!username || !password) {
//     throw new Error(
//       `Username atau password untuk akun ${accountNumber} tidak ditemukan dalam .env`
//     );
//   }

//   try {
//     const refreshToken = await getRefreshToken(username, password);
//     await saveRefreshToken(accountNumber, refreshToken);
//     console.log(
//       `Refresh token untuk akun ${accountNumber} berhasil diatur.`.green
//     );
//   } catch (error) {
//     console.error(
//       `Gagal mengatur refresh token untuk akun ${accountNumber}:`,
//       error.message
//     );
//   }
// }

module.exports = {
  getUsername,
  getBalance,
  getTribe,
  claimFarmReward,
  claimDailyReward,
  startFarmingSession,
  getTasks,
  startTask,
  claimTaskReward,
  getGameId,
  claimGamePoints,
};
