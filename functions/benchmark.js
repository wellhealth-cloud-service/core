const botConfig = require("./auth/apiBotToken.json");

var TelegramTester = require("telegram-test"),
  TelegramBot = require("node-telegram-bot-api"),
  telegramBot = new TelegramBot(botConfig.api_token, {});

describe("Telegram Test", () => {
  const myBot = new TestBot(telegramBot);
  let testChat = 1;
  it("should be able to talk with sample bot", () => {
    const telegramTest = new TelegramTest(telegramBot);
    return telegramTest
      .sendUpdate(testChat, "/ping")
      .then((data) => {
        if (data.text === "pong") {
          return telegramTest.sendUpdate(testChat, "/start");
        }
        throw new Error(`Wrong answer for ping! (was  ${data.text})`);
      })
      .then((data) =>
        telegramTest.sendUpdate(testChat, data.keyboard[0][0].text)
      )
      .then((data) => {
        if (data.text === "Hello, Masha!") {
          return true;
        }
        throw new Error("Wrong greeting!");
      });
  });
});
