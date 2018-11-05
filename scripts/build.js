require('shelljs/global');
config.silent = true;
var fs = require('fs');
//use paths, so libs don't need a -g
var browserify = './node_modules/.bin/browserify';
var derequire = './node_modules/.bin/derequire';
var uglify = './node_modules/.bin/uglifyjs';

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

//final build locations
var banner = '/* wtf_fetch v' + pkg.version;
banner += '\n   github.com/niebert/wtf_fetch\n';
banner += '\n   '+pkg.description;
banner += '\n   based on work of Spencer Kelly github.com/spencermountain/wtf_wikipedia';
banner += '\n   designed as submodule of wtf_wikipedia - decomposition into subtasks';
banner += '\n   Licence: MIT\n*/\n';
var uncompressed = './builds/wtf_fetch.js';
var compressed = './builds/wtf_fetch.min.js';

//cleanup. remove old builds
exec('rm -rf ./builds && mkdir builds');

//add a header, before our sourcecode
echo(banner).to(uncompressed);
echo(banner).to(compressed);

//browserify + derequire
//var cmd = browserify + ' ./src/index.js --standalone wtf';
var cmd = browserify + ' ./src/main.js --standalone wtf_fetch';
cmd += ' -t [ babelify --presets [ env ] ]';
cmd += ' | ' + derequire;
cmd += ' >> ' + uncompressed;
console.log(cmd);
exec(cmd);

//uglify
cmd = uglify + ' ' + uncompressed + ' --mangle --compress ';
cmd += ' >> ' + compressed;
exec(cmd); // --source-map ' + compressed + '.map'

require('./filesize');
