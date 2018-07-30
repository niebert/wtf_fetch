var fs = require('fs');
//print filesizes
var stats = fs.statSync('./builds/wtf_fetch.js');
var fileSize = (stats['size'] / 1000.0).toFixed(2);
console.log('\n\n main: ' + fileSize + 'kb');

stats = fs.statSync('./builds/wtf_fetch.min.js');
fileSize = (stats['size'] / 1000.0).toFixed(2);
console.log('\n\n min: ' + fileSize + 'kb');
