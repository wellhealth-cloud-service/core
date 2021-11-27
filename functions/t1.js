// new Date('2012.08.10').getTime() / 1000

// var d = new Date("YYYY-MM-DD").getTime();
// var d2 = parseInt((new Date().getTime() / 1000).toFixed(0));
// console.log(d2);
// var s = new Date(d2).toLocaleDateString("en-US");
// console.log(s);

const now = require("nano-time");

// var time = new Date().getTime(); // get your number
// var date = new Date(time); // create Date object

// var time = new Date().getTime(); // get your number
// var date = new Date(time); // create Date object

// console.log(date.toString()); // result: Wed Jan 12 2011 12:42:46 GMT-0800 (PST)

// const theBigDay =
//   new Date({
//     year: 2021,
//     month: 11,
//     date: 26,
//     // hours: 12,
//     // minutes: 14,
//     // seconds: 10,
//     // ms: 45,
//   }).getTime * 1000000;

const theBigDay = new Date();
theBigDay.setFullYear(2021, 10, 01);

const theBigDay2 = new Date();
theBigDay2.setFullYear(2021, 12, 20);
// theBigDay.setHours(3, 40, 15, 1524);

// var time = now();
var time = theBigDay.getTime() * 1000000; // get your number
// var time = new Date().getTime() * 1000000; // get your number
var date = new Date(time / 1000000); // create Date object
console.log(date.toString());
console.log(time);

console.log("***");

// console.log(now());
// setTimeout(function () {
//   console.log(now());
// }, 1000);

console.log("***");

// var loadTimeInMS = Date.now();

var performanceNow = require("performance-now");
var c = (theBigDay.getTime() + performanceNow()) * 1000000;
var c2 = (theBigDay2.getTime() + performanceNow()) * 1000000;

var d = new Date(c / 1000000);
var d2 = new Date(c2 / 1000000);
console.log(d.toString());
console.log(d2.toString());

console.log((theBigDay.getTime() + performanceNow()) * 1000000);
console.log((theBigDay2.getTime() + performanceNow()) * 1000000);
console.log("***");
console.log(now());
// now(); // '1476742925219947761' (returns a string)

// setTimeout(function () {
//   console.log(now());
// }, 1000);
// setTimeout(function () {
//   console.log(now());
// }, 1000);
// setTimeout(function () {
//   console.log(now());
// }, 1000);

// now.micro(); // '1476742921398373'
// now.microseconds();
