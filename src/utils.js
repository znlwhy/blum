const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const axiosRetry = require("axios-retry").default;

const api = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status === 500)
    );
  },
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleApiError(error) {
  if (error.response && error.response.data) {
    console.error("❌ Kesalahan API:".red, error.response.data.message);
  } else {
    console.error("❌ Terjadi kesalahan:".red, error.message);
  }
}

module.exports = {
  api,
  delay,
  handleApiError,
};
