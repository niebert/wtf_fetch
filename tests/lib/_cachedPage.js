var fs = require('fs');
function from_file(page, options) {
  var str = fs.readFileSync('./tests/cache/' + page + '.txt', 'utf-8');
  return {
    "wiki":str,
    "title": page,
    "lang":"en",
    "domain":"localfs",
    "pageid":12345,
    "callback":null
  };
}
module.exports = from_file;
