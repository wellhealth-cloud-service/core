const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");
const botConfig = require("./auth/apiBotToken.json");
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const clientSecret = require("./auth/clientSecret2.json");
const clientSecret2 = require("./auth/clientSecret_ml2.json");
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
const now = require("nano-time");
const performanceNow = require("performance-now");
const { atob } = require("buffer");
// datasources and datasets
const weightDataSource = require("./body/weight_datasource.json");
const weightDataSet = require("./body/weight_dataset.json");
const heightDataSource = require("./body/height_datasource.json");
const heightDataSet = require("./body/height_dataset.json");
const fatDataSource = require("./body/fat_datasource.json");
const fatDataSet = require("./body/fat_dataset.json");
const nutritionDataSource = require("./nutrition/nutrition_datasource.json");
const nutritionDataSet = require("./nutrition/nutrition_dataset.json");
const genderDataSource = require("./body/gender_datasource.json");
const genderDataSet = require("./body/gender_dataset.json");
const ageDataSource = require("./body/age_datasource.json");
const ageDataSet = require("./body/age_dataset.json");
const smokerDataSource = require("./body/smoker_datasource.json");
const smokerDataSet = require("./body/smoker_dataset.json");
const alcoholicDataSource = require("./body/alcoholic_datasource.json");
const alcoholicDataSet = require("./body/alcoholic_dataset.json");
const cholesterolDataSource = require("./body/cholesterol_datasource.json");
const cholesterolDataSet = require("./body/cholesterol_dataset.json");
const activeDataSource = require("./body/active_datasource.json");
const activeDataSet = require("./body/active_dataset.json");
const glucoseDataSource = require("./body/glucose_datasource.json");
const glucoseDataSet = require("./body/glucose_dataset.json");
const bloodhDataSource = require("./body/bloodh_datasource.json");
const bloodhDataSet = require("./body/bloodh_dataset.json");
const bloodlDataSource = require("./body/bloodl_datasource.json");
const bloodlDataSet = require("./body/bloodl_dataset.json");
const tipsData = require("./tips/tips.json");

let userId = 0;
let accessToken = "";
let expireyDate = 0;

let accessToken2 = "";
let expireyDate2 = 0;

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

const oauth2Client2 = new google.auth.OAuth2(
  clientSecret2.web.client_id,
  clientSecret2.web.client_secret,
  clientSecret2.web.redirect_uris
);

// AI Platform Training & Prediction API
const scopes2 = [
  "https://www.googleapis.com/auth/cloud-platform", // View and manage your data across Google Cloud Platform services
  "https://www.googleapis.com/auth/cloud-platform.read-only", //View your data across Google Cloud Platform services
];

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
const url = "https://b90f-109-231-73-218.ngrok.io";
// const url = "https://us-central1-spring-duality-330117.cloudfunctions.net/app";
const port = 8090;

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();
app.use(cors({ origin: true }));
// parse the updates to JSON
app.use(express.json());

// exports.app = functions.https.onRequest(app);
// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

exports.helloWorld = (req, res) => {
  res.send("Hello, World!");
};

app.get("/api/hello", (req, res) => {
  return res.status(200).send("hello");
});

renewAccessToken = async (tokens) => {
  try {
    oauth2Client.setCredentials(tokens);
    const access = await oauth2Client.getAccessToken();
    // console.log(`GOOGLEFIT`);
    // console.log(access.res.data);
    accessToken = access.res.data.access_token;
    expireyDate = access.res.data.expiry_date;
    return access.token;
  } catch (error) {
    return null;
  }
};

renewAccessToken2 = async (tokens) => {
  try {
    oauth2Client2.setCredentials(tokens);
    const access = await oauth2Client2.getAccessToken();
    accessToken2 = access.res.data.access_token;
    expireyDate2 = access.res.data.expiry_date;
    // console.log(`GOOGLEAI`);
    return access.token;
  } catch (error) {
    return null;
  }
};

checkAccessTokenValid = async (access_token) => {
  try {
    const options = {
      method: "get",
      url: "https://www.googleapis.com/oauth2/v1/tokeninfo",
      params: {
        access_token: access_token,
        // access_token: "1",
      },
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return false;
  }
};

// TODO: manage refresh_token
isAuthorizedClient = async (id) => {
  try {
    var access_token = await getAccessToken(id);
    return access_token !== null;
  } catch (error) {
    return false;
  }
};

isAuthorizedClient2 = async (id) => {
  try {
    var access_token = await getAccessToken2(id);
    return access_token !== null;
  } catch (error) {
    return false;
  }
};

getAccessToken2 = async (id) => {
  try {
    const snapshot = await db
      .collection("oauth2")
      .where("id", "==", id)
      .orderBy("message_id", "asc")
      .limitToLast(1)
      .get();
    const docs = [];
    snapshot.docs.map((doc) => docs.push(doc.data())); //.limitToFirst(1);

    if (docs.length == 0) return null;
    var access_token = docs[0].access_token;

    if (await checkAccessTokenValid(access_token)) return access_token;

    access_token = await renewAccessToken2(docs[0]);
    return access_token;
  } catch (error) {
    return null;
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

    if (docs.length == 0) return null;
    var access_token = docs[0].access_token;

    if (await checkAccessTokenValid(access_token)) return access_token;

    access_token = await renewAccessToken(docs[0]);
    return access_token;
  } catch (error) {
    return null;
  }
};

getAnalysis = async (id) => {
  try {
    // var accessToken = await getAccessToken2(id);
    // if (accessToken === null) return null;

    var weight = await getWeightDataSet(id);
    var height = await getHeightDataSet(id);
    var gender = await getGenderDataSet(id);
    var age = await getAgeDataSet(id);
    var smoker = await getSmokerDataSet(id);
    var alcoholic = await getAlcoholicDataSet(id);
    var cholesterol = await getCholesterolDataSet(id);
    var active = await getActiveDataSet(id);
    var glucose = await getGlucoseDataSet(id);
    var bloodh = await getBloodhDataSet(id);
    var bloodl = await getBloodlDataSet(id);
    var fat = await getFatDataSet(id);
    var calories = await getNutritionDataSet(id);

    const payload = JSON.stringify({
      payload: {
        row: {
          values: [
            bloodh,
            parseInt(weight),
            smoker,
            parseInt(height.toString().replace(".", "")),
            glucose,
            cholesterol,
            gender,
            active,
            bloodl,
            alcoholic,
            age * 365,
          ],
          columnSpecIds: [
            "5495070493822156800",
            "883384475394768896",
            "2036305980001615872",
            "2612766732305039360",
            "3189227484608462848",
            "6071531246125580288",
            "6647991998429003776",
            "8377374255339274240",
            "1459845227698192384",
            "7224452750732427264",
            "3765688236911886336",
          ],
        },
      },
    });

    // [weight (kg) / height (cm) / height (cm)] x 10,000

    var bmi = weight / (height * height);
    var bmiResult = "";
    //     BMI Ranges
    // BMI	Category
    // < 16.0	Severely Underweight
    // 16.0 - 18.4	Underweight
    // 18.5 - 24.9	Normal
    // 25.0 - 29.9	Overweight
    // 30.0 - 34.9	Moderately Obese
    // 35.0 - 39.9	Severely Obese
    // > 40.0	Morbidly Obese
    // if (bmi < 16) bmiResult = "Severely Underweight";
    // else if (bmi >= 16 && bmi <= 18.4) bmiResult = "Underweight";
    // else if (bmi >= 18.5 && bmi <= 24.9) bmiResult = "Normal";
    // else if (bmi >= 25 && bmi <= 29.9) bmiResult = "Overweight";
    // else if (bmi >= 30 && bmi <= 34.9) bmiResult = "Moderately Obese";
    // else if (bmi >= 35 && bmi <= 39.9) bmiResult = "Severely Obese";
    // else if (bmi >= 40) bmiResult = "Morbidly Obese";

    if (bmi < 16) bmiResult = "🚨";
    else if (bmi >= 16 && bmi <= 18.4) bmiResult = "⚠️";
    else if (bmi >= 18.5 && bmi <= 24.9) bmiResult = "✅";
    else if (bmi >= 25 && bmi <= 29.9) bmiResult = "⚠️";
    else if (bmi >= 30 && bmi <= 34.9) bmiResult = "⚠️";
    else if (bmi >= 35 && bmi <= 39.9) bmiResult = "🚨";
    else if (bmi >= 40) bmiResult = "🚨";

    const options = {
      method: "post",
      url: "https://automl.googleapis.com/v1beta1/projects/databatch/locations/us-central1/models/TBL511772085194850304:predict",
      headers: {
        Authorization: `Bearer ${accessToken2}`,
        "Content-Type": "application/json",
      },
      data: payload,
    };

    const res = await axios(options);
    // console.log(res.data.payload[0].tables.value.toFixed(2));
    // res.data.payload.tables.value.toFixed(2)

    var risk = new Number(res.data.payload[0].tables.value * 100).toPrecision(
      4
    );
    var riskResult = "";

    if (risk <= 25) riskResult = "✅";
    else if (risk <= 45 && risk >= 26) riskResult = "⚠️";
    else riskResult = "🚨";

    var p = tipsData.Item.filter(
      (a) => a.active == active.toString() && a.gender == gender.toString()
    ).map((b) => b.Title);
    var randomnumber = Math.floor(Math.random() * (p.length - 1 - 0 + 1)) + 0;
    var tip = p[randomnumber];

    var result = `<b>WellHealth</b> 🤖 analyzing 🧠 and reporting 📋 results are 👇 \n\n <b>Vitals 🫀</b>\n Weight: ${weight} KG\n Height: ${height} M\n Fat: ${fat} %\n Gender: ${
      gender === 1 ? "male" : "female"
    } \n Age: ${age} Y \n Smoker: ${smoker === 0 ? "No" : "Yes"}\n Alcoholic: ${
      alcoholic === 0 ? "No" : "Yes"
    }\n Cholesterol: ${
      cholesterol === 1 ? "Low" : cholesterol === 2 ? "Mid" : "High"
    }\n Active: ${active === 0 ? "No" : "Yes"}\n Glucose: ${
      glucose === 1 ? "Low" : glucose === 2 ? "Mid" : "High"
    }\n Blood top: ${bloodh} \n Blood low: ${bloodl}\n\n <b>Nutrition 🍔</b>\n Calories consumed: ${
      calories === null ? 0 : calories
    } KCal \n\n <b>Analysis 🔍</b>\n Risk of CVD: ${risk} % ${riskResult}\n BMI: ${bmi.toFixed(
      2
    )} ${bmiResult} \n\n <b>Tip 🔔</b>\n ${tip}\n\n Back to /menu 🏠`;
    // res.data.payload.tables.value.toFixed(2);
    //x.toFixed(2)
    return result;
  } catch (error) {
    return null;
  }
};

getNutritionDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "com.google.nutrition"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = theBigDay.getTime();
    var max = new Date().getTime();

    var data = JSON.stringify({
      aggregateBy: [
        {
          dataSourceId: dataStreamId,
        },
      ],
      bucketByTime: { durationMillis: max - min },
      startTimeMillis: min,
      endTimeMillis: max,
    });

    const options = {
      method: "post",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(options);
    return res.data.bucket[0].dataset[0].point[0].value[0].mapVal[0].value
      .fpVal;
  } catch (error) {
    return null;
  }
};

getFatDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].fpVal;
  } catch (error) {
    return null;
  }
};

getHeightDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].fpVal;
  } catch (error) {
    return null;
  }
};

getWeightDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].fpVal;
  } catch (error) {
    return null;
  }
};

getGenderDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.gender"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getAgeDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.age"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getSmokerDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.smoker"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getAlcoholicDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.alcoholic"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getCholesterolDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.cholesterol"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getActiveDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.active"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getGlucoseDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.glucose"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getBloodhDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.bloodh"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

getBloodlDataSet = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.bloodl"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) return null;

    const theBigDay = new Date();
    theBigDay.setFullYear(2021, 10, 01);
    var min = (theBigDay.getTime() + performanceNow()) * 1000000;
    var max = now();

    const options = {
      method: "get",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const res = await axios(options);
    var len = res.data.point.length - 1;
    return res.data.point[len].value[0].intVal;
  } catch (error) {
    return null;
  }
};

createNutritionDataSet = async (id, meal) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "com.google.nutrition"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createNutritionDataSource(id);
      if (dataStreamId === null) return null;
    }

    const [food, calorie] = meal.split("|");
    var min = now();
    var max = now();

    var dataSet = nutritionDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;
    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].mapVal[0].value.fpVal = parseFloat(calorie);
    dataSet.point[0].value[2].stringVal = food;
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    // console.log(error);
    return null;
  }
};

createNutritionDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = nutritionDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createAgeDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = ageDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createAgeDataSet = async (id, age) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.age"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createAgeDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = ageDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(age);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
  } catch (error) {
    return null;
  }
};

createSmokerDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = smokerDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createSmokerDataSet = async (id, smoker) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.smoker"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createSmokerDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = smokerDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(smoker);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createAlcoholicDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = alcoholicDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createAlcoholicDataSet = async (id, alcoholic) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.alcoholic"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createAlcoholicDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = alcoholicDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(alcoholic);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createCholesterolDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = cholesterolDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createCholesterolDataSet = async (id, cholesterol) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.cholesterol"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createCholesterolDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = cholesterolDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(cholesterol);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createActiveDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = activeDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createActiveDataSet = async (id, active) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.active"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createActiveDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = activeDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(active);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createGlucoseDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = glucoseDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createGlucoseDataSet = async (id, glucose) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.glucose"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createGlucoseDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = glucoseDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(glucose);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createBloodhDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = bloodhDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createBloodhDataSet = async (id, bloodh) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.bloodh"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createBloodhDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = bloodhDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(bloodh);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createBloodlDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = bloodlDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createBloodlDataSet = async (id, bloodl) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.bloodl"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createBloodlDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = bloodlDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(bloodl);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createGenderDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataSource = genderDataSource;

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
    // console.log(error.response);
    return null;
  }
};

createGenderDataSet = async (id, gender) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

    var dataStreamId = null;

    var dataSources = await getDataSource(id);
    if (dataSources !== null) {
      dataStreamId = dataSources.dataSource
        .filter(
          (a) =>
            a.dataStreamName == "user_input" &&
            a.type == "raw" &&
            a.dataType.name == "me.t.wellhealthbot.gender"
        )
        .map((b) => b.dataStreamId);
      dataStreamId = dataStreamId.length !== 0 ? dataStreamId[0] : null;
    }

    if (dataStreamId === null) {
      dataStreamId = await createGenderDataSource(id);
      if (dataStreamId === null) return null;
    }

    var min = now();
    var max = now();

    var dataSet = genderDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].intVal = parseInt(gender);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createFatDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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
    // console.log(error.response);
    return null;
  }
};

createFatDataSet = async (id, fat) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    var min = now();
    var max = now();

    var dataSet = fatDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(fat);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createHeightDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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
    // console.log(error.response.status);
    return null;
  }
};

createHeightDataSet = async (id, height) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    var min = now();
    var max = now();

    var dataSet = heightDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(height);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

createWeightDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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
    // console.log(error.response.status);
    return null;
  }
};

createWeightDataSet = async (id, weight) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

    var min = now();
    var max = now();

    var dataSet = weightDataSet;

    dataSet.minStartTimeNs = min;
    dataSet.maxEndTimeNs = max;
    dataSet.point[0].startTimeNanos = min;
    dataSet.point[0].endTimeNanos = max;

    dataSet.dataSourceId = dataStreamId;
    dataSet.point[0].value[0].fpVal = parseFloat(weight);
    dataSet.point[0].originDataSourceId = dataStreamId;

    const options = {
      method: "patch",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataStreamId}/datasets/${min}-${max}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: dataSet,
    };

    const res = await axios(options);
    return res !== null;
    // return true;
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
    return res !== null;
    // return true;
  } catch (error) {
    return null;
  }
};

getDataSource = async (id) => {
  try {
    // var accessToken = await getAccessToken(id);
    // if (accessToken === null) return null;

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

app.get(`/oauth2callback2`, (req, res) => {
  (async () => {
    try {
      var replyObj = new Object();
      replyObj["headers"] = req.headers;
      replyObj["body"] = req.body;
      replyObj["query"] = req.query;
      replyObj["params"] = req.params;

      const { tokens } = await oauth2Client2.getToken(req.query.code);
      oauth2Client2.setCredentials(tokens);

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
        .collection("oauth2")
        .doc("/" + message_id + "/")
        // .doc("/" + new Date().getTime().toString(36) + "/")
        .create(myObj);

      await fs.writeFile("oauth.txt", jsonObj, function (err) {
        if (err) {
          // return console.log(`<===Error: ${err}===>`);
        }
      });

      return res.redirect("https://t.me/wellhealthbot?start=hi");
      // return res.status(200).send(replyObj);
    } catch (error) {
      // console.log(error);
      return res.status(500).send(error);
    }
  })();
});

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
          // return console.log(`<===Error: ${err}===>`);
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

// const h = `/bot${TOKEN}`;
// exports.h = (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// };

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  //console.log(req.body);
  //console.log(`BODY: ${req.body}`);
  //console.log("body");
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const mainMenu = JSON.stringify({
  inline_keyboard: [
    [{ text: "Vitals 🫀", callback_data: "BM" }],
    [{ text: "Nutrition 🍔", callback_data: "NT" }],
    // [{ text: "Activity 🚴‍♀️", callback_data: "AC" }],
    [{ text: "Analysis 🔍", callback_data: "AN" }],
  ],
});

const bodyMenu = JSON.stringify({
  inline_keyboard: [
    [
      { text: "Weight ⚖️", callback_data: "BM_W" },
      { text: "Height 📐", callback_data: "BM_H" },
      { text: "Fat 🥩", callback_data: "BM_F" },
    ],
    [
      { text: "Gender 👫", callback_data: "BM_G" },
      { text: "Age 🕔", callback_data: "BM_A" },
      { text: "Smoker 🚬", callback_data: "BM_S" },
    ],
    [
      { text: "Alcoholic 🍻", callback_data: "BM_AL" },
      { text: "Cholesterol 🧁", callback_data: "BM_C" },
      { text: "Active ⚽", callback_data: "BM_AC" },
    ],
    [
      { text: "Glucose 🍯", callback_data: "BM_GL" },
      { text: "Blood 🔺", callback_data: "BM_BH" },
      { text: "Blood 🔻", callback_data: "BM_BL" },
    ],
    [{ text: "Main 🏠", callback_data: "Home" }],
  ],
});

const nutritionMenu = JSON.stringify({
  inline_keyboard: [
    [{ text: "Food 🍗", callback_data: "NT_M" }],
    [{ text: "Main 🏠", callback_data: "Home" }],
  ],
});

// Just to ping!
bot.on("message", (msg) => {
  (async () => {
    try {
      // console.log("msg");
      // console.log(msg);
      var id = msg.from.id;
      var isAuth = true;
      var isAuth2 = true;
      var txt =
        msg.reply_to_message === (null || undefined)
          ? msg.text
          : msg.reply_to_message.text;

      if (userId === id) {
        var currentTimeMil = new Date().getTime();
        if (expireyDate - currentTimeMil < 0) {
          isAuth = await isAuthorizedClient(id);
        }
        if (expireyDate2 - currentTimeMil < 0) {
          isAuth2 = await isAuthorizedClient2(1850256092);
        }
      } else {
        userId = id;
        isAuth = await isAuthorizedClient(id);
        isAuth2 = await isAuthorizedClient2(1850256092);
      }
      console.log(accessToken);
      // console.log(txt);
      switch (txt) {
        case "Please enter your blood pressure bottom 👇":
          var res = await createBloodlDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Blood saved ✅");
          else bot.sendMessage(id, "Blood not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your blood pressure top 👇":
          var res = await createBloodhDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Blood saved ✅");
          else bot.sendMessage(id, "Blood not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your glucose 👇":
          var res = await createGlucoseDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Glucose saved ✅");
          else bot.sendMessage(id, "Glucose not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your active 👇":
          var res = await createActiveDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Active saved ✅");
          else bot.sendMessage(id, "Active not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your cholesterol 👇":
          var res = await createCholesterolDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Cholesterol saved ✅");
          else bot.sendMessage(id, "Cholesterol not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your alcoholic 👇":
          var res = await createAlcoholicDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Alcoholic saved ✅");
          else bot.sendMessage(id, "Alcoholic not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your smoker 👇":
          var res = await createSmokerDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Smoker saved ✅");
          else bot.sendMessage(id, "Smoker not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your age 👇":
          var res = await createAgeDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Age saved ✅");
          else bot.sendMessage(id, "Age not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your gender 👇":
          var res = await createGenderDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Gender saved ✅");
          else bot.sendMessage(id, "Gender not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your food 👇":
          var res = await createNutritionDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Food saved ✅");
          else bot.sendMessage(id, "Food not saved ❌");
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: nutritionMenu, parse_mode: "HTML" }
          );
          break;
        case "Please enter your fat 👇":
          var res = await createFatDataSet(id, msg.text);
          if (res) bot.sendMessage(id, "Fat saved ✅");
          else bot.sendMessage(id, "Fat not saved ❌");
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
          bot.sendMessage(
            id,
            "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
            { reply_markup: bodyMenu, parse_mode: "HTML" }
          );
          break;
        case "/connect": // Authorization by Google
          // var isAuth = await isAuthorizedClient(msg.chat.id);

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
            bot.sendMessage(
              id,
              "Please use /menu to view what <b>WellHealth</b> 🤖 can do",
              { parse_mode: "HTML" }
            );
            // bot.sendMessage(msg.chat.id, "I am alive!");
          }

          break;
        // case "/connect2": // Authorization by Google
        //   var isAuth = await isAuthorizedClient2(msg.chat.id);

        //   if (!isAuth) {
        //     const url = oauth2Client2.generateAuthUrl({
        //       // 'online' (default) or 'offline' (gets refresh_token)
        //       access_type: "offline",
        //       // If you only need one scope you can pass it as a string
        //       scope: scopes2,
        //       state: msg.from.id,
        //       include_granted_scopes: true,
        //       prompt: "consent",
        //     });

        //     var markup = JSON.stringify({
        //       inline_keyboard: [
        //         [
        //           {
        //             text: "Authorize me",
        //             url: url,
        //           },
        //         ],
        //       ],
        //     });
        //     bot.sendMessage(
        //       msg.chat.id,
        //       "Hi here! Please authorize <b>WellHealth</b> 🤖 to set up a <b>GoogleFit🏃‍♂️</b> integration.",
        //       { reply_markup: markup, parse_mode: "HTML" }
        //     );
        //   } else {
        //     bot.sendMessage(
        //       id,
        //       "Please use /menu to view what <b>WellHealth</b> 🤖 can do",
        //       { parse_mode: "HTML" }
        //     );
        //     // bot.sendMessage(msg.chat.id, "I am alive!");
        //   }

        //   break;
        case "/start":
          // var isAuth = await isAuthorizedClient(id);
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
          // var isAuth = await isAuthorizedClient(msg.chat.id);
          if (!isAuth)
            bot.sendMessage(
              msg.chat.id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          else {
            bot.sendMessage(
              msg.chat.id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: mainMenu, parse_mode: "HTML" }
            );
          }

          break;
        default:
          // var isAuth = await isAuthorizedClient(id);
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
      // console.log(error);
      bot.sendMessage(msg.chat.id, error);
    }
  })();
});

bot.on("callback_query", function (msg) {
  (async () => {
    try {
      // console.log("callback_query");
      var id = msg.from.id;
      var isAuth = true;
      var isAuth2 = true;

      if (userId === id) {
        var currentTimeMil = new Date().getTime();
        if (expireyDate - currentTimeMil < 0) {
          isAuth = await isAuthorizedClient(id);
        }
        if (expireyDate2 - currentTimeMil < 0) {
          isAuth2 = await isAuthorizedClient2(1850256092);
        }
      } else {
        userId = id;
        isAuth = await isAuthorizedClient(id);
        isAuth2 = await isAuthorizedClient2(1850256092);
      }

      switch (msg.data) {
        case "AN":
          // var isAuth = await isAuthorizedClient(id);

          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🔍", { show_alert: true });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            var data = await getAnalysis(id);
            // console.log(data);
            bot.answerCallbackQuery(msg.id, "🔍", { show_alert: true });
            if (data === null)
              bot.sendMessage(
                id,
                "You need to set <b>Vitals 🫀</b> and <b>Nutrition 🍔</b> data to get the results!",
                { parse_mode: "HTML" }
              );
            else bot.sendMessage(id, data, { parse_mode: "HTML" });
          }

          break;

        case "NT":
          // var isAuth = await isAuthorizedClient(id);

          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🍔", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🍔", { show_alert: false });
            bot.sendMessage(
              id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: nutritionMenu, parse_mode: "HTML" }
            );
          }

          break;

        case "BM":
          // var isAuth = await isAuthorizedClient(id);

          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "📏", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "📏", { show_alert: false });
            bot.sendMessage(
              id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: bodyMenu, parse_mode: "HTML" }
            );
          }

          break;

        case "Home":
          // var isAuth = await isAuthorizedClient(id);

          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🏠", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🏠", { show_alert: false });
            bot.sendMessage(
              id,
              "Alright, choose what <b>WellHealth</b> 🤖 will do 👇",
              { reply_markup: mainMenu, parse_mode: "HTML" }
            );
          }

          break;

        case "BM_W":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Weight (KG)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "⚖️", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "⚖️", { show_alert: false });
            bot.sendMessage(id, "Please enter your weight 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_H":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Height (M)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "📐", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "📐", { show_alert: false });
            bot.sendMessage(id, "Please enter your height 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_F":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Fat (%)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🥩", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🥩", { show_alert: false });
            bot.sendMessage(id, "Please enter your fat 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_G":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "1 (male) / 2 (female)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "👫", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "👫", { show_alert: false });
            bot.sendMessage(id, "Please enter your gender 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_A":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Age (total years)",
          });

          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🕔", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🕔", { show_alert: false });
            bot.sendMessage(id, "Please enter your age 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_S":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "0 (no) / 1 (yes)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🚬", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🚬", { show_alert: false });
            bot.sendMessage(id, "Please enter your smoker 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_AL":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "0 (no) / 1 (yes)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🍻", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🍻", { show_alert: false });
            bot.sendMessage(id, "Please enter your alcoholic 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_C":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "1 (low) / 2 (mid) / 3 (high)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🧁", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🧁", { show_alert: false });
            bot.sendMessage(id, "Please enter your cholesterol 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_AC":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "0 (no) / 1 (yes)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "⚽", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "⚽", { show_alert: false });
            bot.sendMessage(id, "Please enter your active 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_GL":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "1 (low) / 2 (mid) / 3 (high)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🍯", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🍯", { show_alert: false });
            bot.sendMessage(id, "Please enter your glucose 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_BH":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Top (number)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🔺", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🔺", { show_alert: false });
            bot.sendMessage(id, "Please enter your blood pressure top 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "BM_BL":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Bottom (number)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🔻", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🔻", { show_alert: false });
            bot.sendMessage(id, "Please enter your blood pressure bottom 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        case "NT_M":
          // var isAuth = await isAuthorizedClient(id);

          forceReply = JSON.stringify({
            force_reply: true,
            input_field_placeholder: "Food item | Calories consumed (KCal)",
          });
          if (!isAuth) {
            bot.answerCallbackQuery(msg.id, "🍗", { show_alert: false });
            bot.sendMessage(
              id,
              "Please use /connect to link your <b>GoogleFit🏃‍♂️</b> account first.",
              { parse_mode: "HTML" }
            );
          } else {
            bot.answerCallbackQuery(msg.id, "🍗", { show_alert: false });
            bot.sendMessage(id, "Please enter your food 👇", {
              reply_markup: forceReply,
              parse_mode: "HTML",
            });
          }

          break;

        default:
          // var isAuth = await isAuthorizedClient(id);
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
  // console.log(error.code); // => 'EFATAL'
});

// WebHook errors
bot.on("webhook_error", (error) => {
  // console.log(error.code); // => 'EPARSE'
});
