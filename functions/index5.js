const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const botConfig = require("./auth/apiBotToken.json");
const { Storage } = require("@google-cloud/storage");
const serviceAccount = require("./auth/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const batch = db.batch();
const storage = new Storage();

const app = express();
app.use(cors({ origin: true }));
// parse the updates to JSON
app.use(express.json());

// exports.helloWorld = (req, res) => {
//   res.send("Hello, World!");
// };

// process.env.TELEGRAM_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN"
// const TOKEN = botConfig.api_token;
// https://<PUBLIC-URL>
// const url = "https://8d93-109-231-73-218.ngrok.io";
// const url = "https://us-central1-spring-duality-330117.cloudfunctions.net/app";

// No need to pass any parameters as we will handle the updates with Express
// const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
// bot.setWebHook(`${url}/bot${TOKEN}`);

// app.get("/oauthplayground", (req, res) => {
//   var reqObj = new Object();
//   reqObj["headers"] = req.headers;
//   reqObj["quaries"] = req.query;
//   reqObj["body"] = req.body;
//   //const resObj = JSON.stringify(reqObj);

//   return res.status(200).send(reqObj);
// });

exports.app = functions.https.onRequest(app);

// We are receiving updates at the route below!
// app.post(`/bot${TOKEN}`, (req, res) => {
//   console.log("HERE!");
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });

// // Just to ping!
// bot.on("message", (msg) => {
//   bot.sendMessage(msg.chat.id, "I am alive!");
// });
