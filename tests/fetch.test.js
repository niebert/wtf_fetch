'use strict';
var test = require('tape');
var wtf_fetch = require('./lib');

test('fetch-as-promise', t => {
  //t.plan(1);
  var p = wtf_fetch.getPage('Tony Hawk', 'en', 'wikipedia', {
    'Api-User-Agent': 'wtf_fetch test script - <spencermountain@gmail.com>'
  });
  p.then(function(doc) {
    console.log("Promise WIKI: "+doc.wiki);
    t.ok(doc.wiki != "", 'promise returned document');
  });
  p.catch(function(e) {
    t.throw(e);
  });
});

test('fetch-as-callback', t => {
  //t.plan(1);
  wtf_fetch.getPage('Tony Danza', 'en', 'wikipedia', {
    'Api-User-Agent': 'wtf_fetch test script - <spencermountain@gmail.com>'
  }, function(err, doc) {
    console.log("Promise WIKI: "+doc.wiki);
    if (err) {
      t.throw(err);
    }
    t.ok(doc.wiki != "", 'callback returned document');
  });
});
