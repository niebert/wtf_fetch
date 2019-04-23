const fetch = require('./_fetch/fetch');
const random = require('./_fetch/random');
const category = require('./_fetch/category');
const version = require('./_version');
//const parseDocument = require('./01-document/index.js');

//the main 'factory' exported method
const wtf = function(wiki, options) {
  //return parseDocument(wiki, options);
  return {
    "wiki": wiki,
    "options": options
  };
};
wtf.fetch = function(title, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return fetch(title, lang, domain, options, cb);
};
wtf.random = function(lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return random(lang,domain, options, cb);
};
wtf.category = function(cat, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return category(cat, lang,domain, options, cb);
};

wtf.getPage = function(title, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return fetch(title, lang, domain, options, cb);
};

wtf.version = version;

module.exports = wtf;
