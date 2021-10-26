/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */

const TelegramBot = require("node-telegram-bot-api");
var botConfig = require("./auth/apiBotToken.json");
const express = require("express");

const TOKEN = botConfig.api_token;
const url = "https://f478-109-231-73-218.ngrok.io";
const port = 8090;

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(express.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Just to ping!
bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "I am alive!");
});
