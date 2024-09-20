const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

function sendNotification(userId, message) {
  bot.sendMessage(userId, message);
}

module.exports = { sendNotification };
