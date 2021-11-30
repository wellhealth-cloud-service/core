// var meal = "kebab|856";

// const [food, calorie] = meal.split("|");

// console.log(food);
// console.log(calorie);

// var w = 72.1;
// console.log(parseInt(w.toString().replace(".", "")));

const tips = require("./tips/tips.json");

var hm = JSON.stringify({
  Item: [
    {
      Type: "Topic",
      Id: "25",
      Title: "Consume less salt and sugar",
      active: "0",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "327",
      Title: "Eat a healthy diet",
      active: "0",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "329",
      Title: "Reduce intake of harmful fats",
      active: "0",
      gender: "2",
    },
    {
      Type: "Topic",
      Id: "350",
      Title: "Avoid harmful use of alcohol",
      active: "1",
      gender: "2",
    },
    {
      Type: "Topic",
      Id: "510",
      Title: "Don't smoke ",
      active: "0",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "512",
      Title: "Be more active",
      active: "0",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "514",
      Title: "Get Tested for Breast Cancer",
      active: "1",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "527",
      Title: "Check your blood pressure regularly",
      active: "1",
      gender: "2",
    },
    {
      Type: "Topic",
      Id: "528",
      Title: "Take antibiotics only as prescribed",
      active: "1",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "529",
      Title: "Take vitamin D if you're deficient",
      active: "0",
      gender: "1",
    },
    {
      Type: "Topic",
      Id: "530",
      Title: "Eat plenty of fruits and vegetables",
      active: "1",
      gender: "2",
    },
    {
      Type: "Topic",
      Id: "531",
      Title: "Drink 8L of water per day!",
      active: "1",
      gender: "2",
    },
    {
      Type: "Topic",
      Id: "532",
      Title: "Talk to Your Doctor About Abdominal Aortic Aneurysm",
      active: "0",
      gender: "2",
    },
  ],
});

var p = tips.Item.filter((a) => a.active == "0" && a.gender == "2").map(
  (b) => b.Title
); // [03]

var randomnumber = Math.floor(Math.random() * (p.length - 1 - 0 + 1)) + 0;

console.log(p[randomnumber]);
