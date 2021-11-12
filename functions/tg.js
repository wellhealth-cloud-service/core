const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");
const botConfig = require("./auth/apiBotToken.json");
const express = require("express");
const { json } = require("express");
const { google } = require("googleapis");
const clientSecret = require("./auth/clientSecret.json");
const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const serviceAccount = require("./auth/serviceAccount.json");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const batch = db.batch();
const storage = new Storage();

const oauth2Client = new google.auth.OAuth2(
  clientSecret.web.client_id,
  clientSecret.web.client_secret,
  clientSecret.web.redirect_uris
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  "https://www.googleapis.com/auth/fitness.activity.read", // Use Google Fit to see and store your physical activity data
  "https://www.googleapis.com/auth/fitness.activity.write", //	See and add to your Google Fit physical activity data
  "https://www.googleapis.com/auth/fitness.blood_glucose.read", //	See info about your blood glucose in Google Fit. I consent to Google sharing my blood glucose information with this app.
  "https://www.googleapis.com/auth/fitness.blood_glucose.write", //	See and add info about your blood glucose to Google Fit. I consent to Google sharing my blood glucose information with this app.
  "https://www.googleapis.com/auth/fitness.blood_pressure.read", //	See info about your blood pressure in Google Fit. I consent to Google sharing my blood pressure information with this app.
  "https://www.googleapis.com/auth/fitness.blood_pressure.write", //	See and add info about your blood pressure in Google Fit. I consent to Google sharing my blood pressure information with this app.
  "https://www.googleapis.com/auth/fitness.body.read", //	See info about your body measurements and heart rate in Google Fit
  "https://www.googleapis.com/auth/fitness.body.write", //	See and add info about your body measurements and heart rate to Google Fit
  "https://www.googleapis.com/auth/fitness.body_temperature.read", //	See info about your body temperature in Google Fit. I consent to Google sharing my body temperature information with this app.
  "https://www.googleapis.com/auth/fitness.body_temperature.write", //	See and add to info about your body temperature in Google Fit. I consent to Google sharing my body temperature information with this app.
  "https://www.googleapis.com/auth/fitness.heart_rate.read", //	See your heart rate data in Google Fit. I consent to Google sharing my heart rate information with this app.
  "https://www.googleapis.com/auth/fitness.heart_rate.write", //	See and add to your heart rate data in Google Fit. I consent to Google sharing my heart rate information with this app.
  "https://www.googleapis.com/auth/fitness.location.read", //	See your Google Fit speed and distance data
  "https://www.googleapis.com/auth/fitness.location.write", //	See and add to your Google Fit location data
  "https://www.googleapis.com/auth/fitness.nutrition.read", //	See info about your nutrition in Google Fit
  "https://www.googleapis.com/auth/fitness.nutrition.write", //	See and add to info about your nutrition in Google Fit
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read", //	See info about your oxygen saturation in Google Fit. I consent to Google sharing my oxygen saturation information with this app.
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.write", //	See and add info about your oxygen saturation in Google Fit. I consent to Google sharing my oxygen saturation information with this app.
  "https://www.googleapis.com/auth/fitness.reproductive_health.read", //	See info about your reproductive health in Google Fit. I consent to Google sharing my reproductive health information with this app.
  "https://www.googleapis.com/auth/fitness.reproductive_health.write", //	See and add info about your reproductive health in Google Fit. I consent to Google sharing my reproductive health information with this app.
  "https://www.googleapis.com/auth/fitness.sleep.read", // 	See your sleep data in Google Fit. I consent to Google sharing my sleep information with this app.
  "https://www.googleapis.com/auth/fitness.sleep.write", //	See and add to your sleep data in Google Fit. I consent to Google sharing my sleep information with this app.
];

const TOKEN = botConfig.api_token;
const url = "https://8d93-109-231-73-218.ngrok.io";
const port = 8090;

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(express.json());

app.get(`/oauth2callback`, (req, res) => {
  (async () => {
    try {
      var replyObj = new Object();
      replyObj["headers"] = req.headers;
      replyObj["body"] = req.body;
      replyObj["query"] = req.query;
      replyObj["params"] = req.params;

      const { tokens } = await oauth2Client.getToken(req.query.code);
      oauth2Client.setCredentials(tokens);

      replyObj["tokens"] = tokens;

      const jsonObj = JSON.stringify(replyObj);

      var myObj = {
        code: req.query.code,
        id: req.query.state,
        scope: tokens.scope,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
      };
      const myJson = JSON.stringify(myObj);

      await db
        .collection("oauth")
        .doc("/" + new Date().getTime().toString(36) + "/")
        .create(myObj);

      await fs.writeFile("oauth.txt", jsonObj, function (err) {
        if (err) {
          return console.log(`<===Error: ${err}===>`);
        }
      });

      return res.status(200).send(replyObj);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// create
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      await db
        .collection("items")
        .doc("/" + req.body.id + "/")
        .create({ item: req.body.item, color: "blue" });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  //console.log(req.body);
  //console.log(`BODY: ${req.body}`);
  //console.log("body");
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Just to ping!
bot.on("message", (msg) => {
  (async () => {
    try {
      switch (msg.text) {
        case "/connect":
          const url = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: "offline",
            // If you only need one scope you can pass it as a string
            scope: scopes,
            state: msg.from.id,
            include_granted_scopes: true,
          });
          bot.sendMessage(
            msg.chat.id,
            `Open this link to authorize the bot:\r\n${url}`
          );
          break;
        default:
          bot.sendMessage(msg.chat.id, "I am alive!");
      }
      // Save the message
      await db
        .collection("messages")
        .doc("/" + msg.message_id + "/")
        .create(msg);
    } catch (error) {
      console.log(error);
      bot.sendMessage(msg.chat.id, error);
    }
  })();
});

// bot.onText(/\/connect/, (msg) => {
//   bot.sendMessage(msg.chat.id, "Connecting ...");
// });

// Error handling
// bot.sendMessage(nonExistentUserId, "text").catch((error) => {
//   console.log(error.code); // => 'ETELEGRAM'
//   console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
// });

// Polling errors
bot.on("polling_error", (error) => {
  console.log(error.code); // => 'EFATAL'
});

// WebHook errors
bot.on("webhook_error", (error) => {
  console.log(error.code); // => 'EPARSE'
});
