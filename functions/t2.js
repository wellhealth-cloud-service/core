const ds = require("./body/datasource.json");

// let arr = [
//   { name: "string 1", value: "this", other: "that" },
//   { name: "string 2", value: "this", other: "that" },
// ];

// let obj = ds.find((o) => o.dataSource === (a) => a.dataStreamName===);

var p = ds.dataSource
  .filter(
    (a) =>
      a.dataStreamName == "user_input" &&
      a.type == "raw" &&
      a.dataType.name == "com.google.height"
    // a.items.some(item => item.name === 'milk')
  )
  .map((b) => b.dataStreamId); // [03]

console.log(p.length);
