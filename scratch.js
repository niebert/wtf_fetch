'use strict';
const wtf_fetch = require('./src/index');

function receiveDoc(pDoc) {
  console.log("JSON:"+JSON.stringify(pDoc,null,4));
}

/*
(async () => {
  var doc = await wtf_fetch.getPage("water","en","wikiversity",receiveDoc);
  //var doc = await wtf_fetch.getPage("water","en",receiveDoc);
})();
*/

(async () => {
  //var doc = await wtf_fetch.fetch("water","en","wikiversity",receiveDoc);
  var doc = await wtf_fetch.random();
  receiveDoc(doc);
})();
