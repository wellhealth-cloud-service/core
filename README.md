# Introduction

WellHealth is a cloud-based web service to get, store, and analyze the users’ data and show them how their health status is going on and how to improve it during a specific time. Using the Telegram cloud messenger bot as UI, users will authorize themselves and give the  required consent to the WellHealth service to access their Google Fit accounts. Provided all the services and functions in Google clouds, the user sends data and receives overall information regarding their health and diet and exercise program to keep or improve their condition. These functionalities perform on Google cloud services such as Google Functions, Google Fit, Google AutoML, Firestore, and REST API services. This document discusses the WellHealth requirements, design, functionality, implementation, diagrams, cost, and revenue.


# Core

add rules to .eslintrc.js to perform on windows/unix
remove . from eslint in package.json
in order to kill other sessions tskill /A ngrok
ngrok http 127.0.0.1:8090 -host-header="127.0.0.1:8090"

# TG fotmatting options

https://core.telegram.org/bots/api#formatting-options

# TG sending msg

https://core.telegram.org/bots/api#sendmessage

# Firestore Node.js

https://googleapis.dev/nodejs/firestore/latest/Query.html#select

# Fitbit to GoogleFit

https://play.google.com/store/apps/details?id=fitapp.fittofit

# starts the bot

https://t.me/wellhealthbot?start=hi

# Oauth consent screen

https://console.cloud.google.com/apis/credentials/consent?project=spring-duality-330117

# OAuth 2.0 Scopes for Google APIs

https://developers.google.com/identity/protocols/oauth2/scopes

# Functions Framework for Node.js

https://github.com/GoogleCloudPlatform/functions-framework-nodejs
https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package

pack build --builder gcr.io/buildpacks/builder:v1 --env GOOGLE_FUNCTION_SIGNATURE_TYPE=http --env GOOGLE_FUNCTION_TARGET=app wellhealth-bot

docker tag wellhealth-bot saeedrahmo/wellhealth-bot

docker push saeedrahmo/wellhealth-bot

# Screenshots

![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/Architecture.png?raw=true "Architecture design of WellHealth")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/InteractionGoogleOauth.png?raw=true "Interaction view of WellHealth with Google Oauth")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/InteractionGoogleFit.png?raw=true "Interaction view of WellHealth with Google Fit")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/InteractionGoogleAutoML.png?raw=true "Interaction view of WellHealth with Google AutoML")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/RestAPI.png?raw=true "Rest API in WellHealth")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/GoogleAutoML.png?raw=true "Smartness of Google AutoML in feature engineering and building model")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/bot.png?raw=true "Result of starting the WellHealth bot")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/authorization.png?raw=true "Available menu after successful authorization")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/options.png?raw=true "Options of Vitals that user must enter")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/nutrition.png?raw=true "Options of Nutrition that user must enter")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/results.png?raw=true "Results of analysis of Well Health")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/test1.png?raw=true "Execution of /analysis command of WellHealthBot for 1000 times over Telegram API")
![ScreenShot](https://github.com/wellhealth-cloud-service/core/blob/main/screenshots/test2.png?raw=true "Overall monitoring for 30 days from beginning to deploy and demo")
