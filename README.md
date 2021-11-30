# core

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
