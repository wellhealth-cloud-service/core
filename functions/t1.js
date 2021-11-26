// new Date('2012.08.10').getTime() / 1000

// var d = new Date("YYYY-MM-DD").getTime();
// var d2 = parseInt((new Date().getTime() / 1000).toFixed(0));
// console.log(d2);
// var s = new Date(d2).toLocaleDateString("en-US");
// console.log(s);

const now = require("nano-time");

// console.log(now());
// sleep(1000).then(() => {
//   console.log(now());
// });

// now(); // '1476742925219947761' (returns a string)
console.log(now());
setTimeout(function () {
  console.log(now());
}, 1000);
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
