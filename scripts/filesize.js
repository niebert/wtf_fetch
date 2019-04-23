var fs = require('fs');
var pkg = require('../package.json');
//print filesizes
var stats = fs.statSync('./builds/'+pkg.name+'.js');
var fileSize = (stats['size'] / 1000.0).toFixed(2);
console.log('\n\nSize builds/'+ pkg.name+'.js\n   ' + fileSize + 'kb');

stats = fs.statSync('./builds/'+pkg.name+'.min.js');
fileSize = (stats['size'] / 1000.0).toFixed(2);
console.log('\nSize: builds/'+ pkg.name+'.min.js\n   ' + fileSize + 'kb\n');
