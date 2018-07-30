'use strict';
const wtf_fetch = require('./src/index');

function receiveDoc(pDoc) {
  console.log("JSON:"+JSON.stringify(pDoc,null,4));
}

console.log(wtf_fetch.getPage("Water","en","wikiversity",receiveDoc);
