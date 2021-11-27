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
const { docs } = require("googleapis/build/src/apis/docs");
const axios = require("axios").default;
const querystring = require("querystring");
const qs = require("qs");
const { iam } = require("googleapis/build/src/apis/iam");
const { datastore } = require("googleapis/build/src/apis/datastore");
// datasources and datasets
const weightDataSource = require("./body/weight_datasource.json");
const weightDataSet = require("./body/weight_dataset.json");
const heightDataSource = require("./body/height_datasource.json");
const heightDataSet = require("./body/height_dataset.json");
const fatDataSource = require("./body/fat_datasource.json");
const fatDataSet = require("./body/fat_dataset.json");

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

// const fit = google.fitness({
//   varsion: "v2",
//   auth: oauth2Client,
// });

// const drive = google.drive({
//   version: "v2",
//   auth: oauth2Client,
// });

//TODO: integrate all in one option
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
const url = "https://6516-142-137-165-45.ngrok.io";
const port = 8090;

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(express.json());

//https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken
// TODO: manage refresh_token
isAuthorizedClient = async (id) => {
  try {
    const snapshot = await db
      .collection("oauth")
      // .where(u'photos.id1', u'==', True)
      // .where("chat", "array-contains", { id: 89370592 })
      // .where("chat.id", "array-contains", ["89370592"])
      .where("id", "==", id)
      .orderBy("message_id", "asc")
      .limitToLast(1)
      // .select("message_id")
      // .limit(1)
      .get();
    const docs = [];
    snapshot.docs.map((doc) => docs.push(doc.data())); //.limitToFirst(1);
    // console.log(docs[0].access_token);

    // expires_in
    // OPTIONAL.  The lifetime in seconds of the access token.  For
    // example, the value "3600" denotes that the access token will
    // expire in one hour from the time the response was generated.

    // axios
    //   .get("https://www.googleapis.com/oauth2/v1/tokeninfo", {
    //     params: {
    //       access_token: docs[0].access_token,
    //     },
    //   })
    //   .then(function (response) {
    //     console.log(response.data);
    //   })
    //   .catch(function (error) {
    //     console.log("error");
    //   })
    //   .then(function () {
    //     // always executed
    //   });

    if (docs.length == 0) return false;

    const options = {
      method: "get",
      url: "https://www.googleapis.com/oauth2/v1/tokeninfo",
      params: {
        access_token: docs[0].access_token,
        // access_token: "1",
      },
    };

    const res = await axios(options);
    return true;
    // return typeof res.data !== "undefined" ? true : false;

    // axios(options)
    //   .then(function (response) {
    //     //response.data
    //     console.log("true");
    //     return true;
    //   })
    //   .catch(function (error) {
    //     console.log("error");
    //     return false;
    //   })
    //   .then(function () {
    //     // always executed
    //     //return false;
    //   });

    // const params = new URLSearchParams();
    // params.append("access_token", docs[0].access_token);

    // const params = new URLSearchParams({
    //   access_token: docs[0].access_token,
    // }).toString();
    //const url = "https://www.googleapis.com/oauth2/v1/tokeninfo";

    // const url = "https://www.googleapis.com/oauth2/v1/tokeninfo?" + params;

    // var access_token = docs[0].access_token;

    // var data = {};

    // const params = new URLSearchParams({
    //   access_token: docs[0].access_token,
    // }).toString();

    // const url = "https://www.googleapis.com/oauth2/v1/tokeninfo?" + params;
    // console.log(url);

    // const tokenSend = { access_token };

    // axios
    //   .get("https://www.googleapis.com/oauth2/v1/tokeninfo/", tokenSend)
    //   .then((res) => {
    //     this.Info = JSON.parse(res.data);
    //   })
    //   .catch((err) => {
    //     console.log("err");
    //   });

    // axios
    //   .post(`https://www.googleapis.com/oauth2/v1/tokeninfo?`, null, {
    //     params: {
    //       access_token,
    //     },
    //   })
    //   .then((response) => console.log("response"))
    //   .catch((err) => console.log("error"));

    // axios
    //   .get("https://www.googleapis.com/oauth2/v1/tokeninfo?", params)
    //   .then(function (response) {
    //     console.log("response");
    //   })
    //   .catch(function (error) {
    //     console.log("error");
    //   })
    //   .then(function () {
    //     // always executed
    //   });

    // axios.post('http://something.com/', querystring.stringify({ foo: 'bar' }));

    // const options = {
    //   method: "get",
    //   // headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   data: {},
    //   url: url,
    //   // params: params.toString(),
    // };

    // axios(options)
    //   .then(function (response) {
    //     console.log("response");
    //   })
    //   .catch(function (error) {
    //     console.log("error");
    //   })
    //   .then(function () {
    //     // always executed
    //   });

    // Optionally the request above could also be done as
    // axios
    //   .get("/user", {
    //     params: {
    //       ID: 12345,
    //     },
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   })
    //   .then(function () {
    //     // always executed
    //   });

    // axios.get("/user/12345").then(function (response) {
    //   console.log(response.data);
    //   console.log(response.status);
    //   console.log(response.statusText);
    //   console.log(response.headers);
    //   console.log(response.config);
    // });

    // const options = {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   data: qs.stringify(data),
    //   url,
    // };
    // axios(options);

    // const querystring = require('querystring');
    // axios.post('http://something.com/', querystring.stringify({ foo: 'bar' }));

    // const snapshot = await db.collection("oauth").where("id", "==", id).orderBy("").get();
    // const docs = [];
    // snapshot.docs.map((doc) => docs.push(doc.data())); //.limitToFirst(1);

    // var jsonObj = JSON.stringify(docs);

    // console.log(docs);
  } catch (error) {
    return false;
  }
};

getAccessToken = async (id) => {
  try {
    const snapshot = await db
      .collection("oauth")
      .where("id", "==", id)
      .orderBy("message_id", "asc")
      .limitToLast(1)
      .get();
    const docs = [];
    snapshot.docs.map((doc) => docs.push(doc.data())); //.limitToFirst(1);

    return docs.length == 0 ? null : docs[0].access_token;
  } catch (error) {
    return null;
  }
};

createFatDataSource = async (id) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataSource = fatDataSource;

    const options = {
      method: "post",
      url: "https://www.googleapis.com/fitness/v1/users/me/dataSources",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSource,
    };

    const res = await axios(options);
    return res.data.dataStreamId;
  } catch (error) {
    console.log(error.response);
    return null;
  }
};

createFatDataSet = async (id, fat) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "com.google.body.fat.percentage"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createFatDataSource(id);
      if (dataStreamId === null) return null;
    }

    var dataSet = fatDataSet;
    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(fat);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/1637951928905590600-1637951929907695000`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return true;
  } catch (error) {
    return null;
  }
};

createHeightDataSource = async (id) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataSource = heightDataSource;

    const options = {
      method: "post",
      url: "https://www.googleapis.com/fitness/v1/users/me/dataSources",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSource,
    };

    const res = await axios(options);
    return res.data.dataStreamId;
  } catch (error) {
    console.log(error.response.status);
    return null;
  }
};

createHeightDataSet = async (id, height) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "com.google.height"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createHeightDataSource(id);
      if (dataStreamId === null) return null;
    }

    var dataSet = heightDataSet;
    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(height);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/1637951928905590600-1637951929907695000`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return true;
  } catch (error) {
    return null;
  }
};

createWeightDataSource = async (id) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataSource = weightDataSource;

    const options = {
      method: "post",
      url: "https://www.googleapis.com/fitness/v1/users/me/dataSources",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSource,
    };

    const res = await axios(options);
    return res.data.dataStreamId;
  } catch (error) {
    console.log(error.response.status);
    return null;
  }
};

createWeightDataSet = async (id, weight) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "com.google.weight"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createWeightDataSource(id);
      if (dataStreamId === null) return null;
    }

    var dataSet = weightDataSet;
    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(weight);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/1637951928905590600-1637951929907695000`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return true;
  } catch (error) {
    return null;
  }
};

createDataSource = async (id) => {
  try {
    var dataSource = {
      dataStreamName: "MyDataSource",
      type: "derived",
      application: {
        detailsUrl: "http://example.com",
        name: "Foo Example App",
        version: "1",
      },
      dataType: {
        field: [
          {
            name: "steps",
            format: "integer",
          },
        ],
        name: "com.google.step_count.delta",
      },
      device: {
        manufacturer: "Example Manufacturer",
        model: "ExampleTablet",
        type: "tablet",
        uid: "1000001",
        version: "1",
      },
    };

    var accessToken = getAccessToken(id);
    if (accessToken === null) return null;

    const options = {
      method: "get",
      url: "https://www.googleapis.com/oauth2/v1/tokeninfo",
      params: {
        access_token: docs[0].access_token,
        // access_token: "1",
      },
    };

    const res = await axios(options);
    return true;
  } catch (error) {
    return null;
  }
};

getDataSource = async (id) => {
  try {
    var accessToken = await getAccessToken(id);
    if (accessToken === null) return null;

    const options = {
      method: "get",
      url: "https://www.googleapis.com/fitness/v1/users/me/dataSources",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    return res.data;
  } catch (error) {
    return null;
  }
};

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

      const snapshot = await db
        .collection("messages")
        .where("chat.id", "==", parseInt(req.query.state))
        .orderBy("message_id", "asc")
        .limitToLast(1)
        .select("message_id")
        .get();

      const docs = [];
      snapshot.docs.map((doc) => docs.push(doc.data())); //.limitToFirst(1);
      var message_id = docs[0].message_id;

      var myObj = {
        code: req.query.code,
        id: parseInt(req.query.state),
        scope: tokens.scope,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        message_id: message_id,
      };
      const myJson = JSON.stringify(myObj);

      await db
        .collection("oauth")
        .doc("/" + message_id + "/")
        // .doc("/" + new Date().getTime().toString(36) + "/")
        .create(myObj);

      await fs.writeFile("oauth.txt", jsonObj, function (err) {
        if (err) {
          return console.log(`<===Error: ${err}===>`);
        }
      });

      return res.redirect("https://t.me/wellhealthbot?start=hi");
      // return res.status(200).send(replyObj);
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
      // console.log("msg");
      // console.log(msg);
      var id = msg.from.id;
      var txt =
        msg.reply_to_message === (null || undefined)
          ? msg.text
          : msg.reply_to_message.text;
      // console.log(txt);
      switch (txt) {
        case "Please enter your fat 👇":
          console.log("FAT");
          var res = await createFatDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Fat saved ✅");
          else bot.sendMessage(id, "Fat not saved ❌");
          var bodyMenu = JSON.stringify({
            inline_keyboard: [
              [
                { text: "Weight ⚖️", callback_data: "BM_W" },
                { text: "Height 📐", callback_data: "BM_H" },
                { text: "Body fat 🥩", callback_data: "BM_F" },
              ],
              [{ text: "Main menu 🏠", callback_data: "BM_Home" }],
            ],
          });
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your height 👇":
          var res = await createHeightDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Height saved ✅");
          else bot.sendMessage(id, "Height not saved ❌");
          var bodyMenu = JSON.stringify({
            inline_keyboard: [
              [
                { text: "Weight ⚖️", callback_data: "BM_W" },
                { text: "Height 📐", callback_data: "BM_H" },
                { text: "Body fat 🥩", callback_data: "BM_F" },
              ],
              [{ text: "Main menu 🏠", callback_data: "BM_Home" }],
            ],
          });
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your weight 👇":
          var res = await createWeightDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Weight saved ✅");
          else bot.sendMessage(id, "Weight not saved ❌");
          var bodyMenu = JSON.stringify({
            inline_keyboard: [
              [
                { text: "Weight ⚖️", callback_data: "BM_W" },
                { text: "Height 📐", callback_data: "BM_H" },
                { text: "Body fat 🥩", callback_data: "BM_F" },
              ],
              [{ text: "Main menu 🏠", callback_data: "BM_Home" }],
            ],
          });
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "/connect": // Authorization by Google
          var isAuth = await isAuthorizedClient(msg.chat.id);

          if (!isAuth) {
            const url = oauth2Client.generateAuthUrl({
              // 'online' (default) or 'offline' (gets refresh_token)
              access_type: "offline",
              // If you only need one scope you can pass it as a string
              scope: scopes,
              state: msg.from.id,
              include_granted_scopes: true,
              prompt: "consent",
            });

            var markup = JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Authorize me",
                    url: url,
                  },
                ],
              ],
            });
            bot.sendMessage(
              msg.chat.id,
              "Hi here! Please authorize <b>WellHealth</b> 🤖 to set up a <b>GoogleFit🏃‍♂️</b> integration.",
              { reply_markup: markup, parse_mode: "HTML" }
            );
          } else {
            bot.sendMessage(msg.chat.id, "I am alive!");
          }

          break;
        case "/start":
          var isAuth = await isAuthorizedClient(id);
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else
            bot.sendMessage(
              id,
              "Please use /menu to view what <b>WellHealth</b> 🤖 can do",
              { parse_mode: "HTML" }
            );
          break;
        case "/menu": // Open menu
          var isAuth = await isAuthorizedClient(msg.chat.id);
          if (!isAuth)
            bot.sendMessage(
              msg.chat.id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            var mainMenu = JSON.stringify({
              inline_keyboard: [
                [
                  { text: "Body measurements 📏", callback_data: "BM" },
                  { text: "Nutrition 🍔", callback_data: "NT" },
                ],
                [
                  { text: "Activity 🚴‍♀️", callback_data: "AC" },
                  { text: "Vitals 🩺", callback_data: "VT" },
                ],
              ],
            });
            bot.sendMessage(
              msg.chat.id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: mainMenu, parse_mode: "HTML" }
            );
          }

          break;
        default:
          var isAuth = await isAuthorizedClient(id);
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else
            bot.sendMessage(
              id,
              "Please use /menu to view what <b>WellHealth</b> 🤖 can do",
              { parse_mode: "HTML" }
            );
          break;
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

bot.on("callback_query", function (msg) {
  (async () => {
    try {
      console.log("callback_query");
      var id = msg.from.id;
      switch (msg.data) {
        case "BM":
          bot.answerCallbackQuery(msg.id, "📏", { show_alert: false });

          var isAuth = await isAuthorizedClient(id);
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            var bodyMenu = JSON.stringify({
              inline_keyboard: [
                [
                  { text: "Weight ⚖️", callback_data: "BM_W" },
                  { text: "Height 📐", callback_data: "BM_H" },
                  { text: "Body fat 🥩", callback_data: "BM_F" },
                ],
                [{ text: "Main menu 🏠", callback_data: "BM_Home" }],
              ],
            });
            bot.sendMessage(
              id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: bodyMenu, parse_mode: "HTML" }
            );
          }

          break;

        case "BM_Home":
          bot.answerCallbackQuery(msg.id, "🏠", { show_alert: false });

          var isAuth = await isAuthorizedClient(id);
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            var mainMenu = JSON.stringify({
              inline_keyboard: [
                [
                  { text: "Body measurements 📏", callback_data: "BM" },
                  { text: "Nutrition 🍔", callback_data: "NT" },
                ],
                [
                  { text: "Activity 🚴‍♀️", callback_data: "AC" },
                  { text: "Vitals 🩺", callback_data: "VT" },
                ],
              ],
            });
            bot.sendMessage(
              id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: mainMenu, parse_mode: "HTML" }
            );
          }

          break;
        case "BM_W":
          bot.answerCallbackQuery(msg.id, "⚖️", { show_alert: false });

          var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Weight (KG)",
          });
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            bot.sendMessage(id, "Please enter your weight 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }
          break;
        case "BM_H":
          bot.answerCallbackQuery(msg.id, "📐", { show_alert: false });

          var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Height (CM)",
          });
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            bot.sendMessage(id, "Please enter your height 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }
          break;
        case "BM_F":
          bot.answerCallbackQuery(msg.id, "🥩", { show_alert: false });

          var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Fat (%)",
          });
          if (!isAuth)
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            bot.sendMessage(id, "Please enter your fat 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }
          break;
        case "1":
          // bot.sendMessage(msg.from.id, "I am alive 1!");
          bot.answerCallbackQuery(msg.id, "You sent 1", { show_alert: false });
          bot.sendMessage(msg.from.id, "I am alive 0!");
          break;
        default:
          bot.sendMessage(msg.from.id, "I am alive 0!");

          break;
      }
    } catch (error) {
      // console.log(error);
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
