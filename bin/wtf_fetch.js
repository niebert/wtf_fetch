#!/usr/bin/env node
var wtf_fetch = require('../src/index');
var args = process.argv.slice(2, process.argv.length);

var modes = {
  '--wikipedia': 'wikipedia',
  '--wikiversity': 'wikiversity',
  '--wikivoyage': 'wikivoyage'
};
var mode = 'wikipedia';
args = args.filter((arg) => {
  if (modes.hasOwnProperty(arg) === true) {
    mode = modes[arg];
    return false;
  }
  return true;
});

var title = args.join(' ');
if (!title) {
  throw new Error('Usage: wtf_fetch Toronto Blue Jays --wikipedia');
}

wtf.fetch(title, 'en', function (err, doc) {
  if (err) {
    console.error(err);
  }
  if (mode === 'json') {
    console.log(JSON.stringify(doc[mode](), null, 0));
  } else {
    console.log(doc[mode]());
  }
});
