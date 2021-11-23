// new Date('2012.08.10').getTime() / 1000

var d = new Date("YYYY-MM-DD").getTime();
var d2 = parseInt((new Date().getTime() / 1000).toFixed(0));
console.log(d2);
var s = new Date(d2).toLocaleDateString("en-US");
console.log(s);
