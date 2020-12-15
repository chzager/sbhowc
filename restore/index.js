"use strict";

console.log("index.js");

let d = new Dhtml2("lsrestore.xml", () => { console.log("Dhlmt callback"); });

// Dhtml2.includeScript("lsrestore.js");

/*
let ds = "2020-12-10T12:46:15.012Z";
let d = new Date().fromIsoString("2020-12-10T12:46:15.012Z");
console.log(ds, d);
console.log(d.toIsoFormatText());
*/
