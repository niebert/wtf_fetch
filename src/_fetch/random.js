const request = require('./_request');
const getParams = require('./_params');
const makeUrl = require('./_url').random;

//this data-format from mediawiki api is nutso
const postProcess = function(data, lang,domain) {
  let pages = Object.keys(data.query.pages);
  let id = pages[0];
  let page = data.query.pages[id] || {};
  if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
    return null;
  }
  //us the 'generator' result format, for the random() method
  let text = page.revisions[0].slots.main['*'];
  let wikipage = {
    wiki: text,
    title: page.title,
    lang: lang,
    domain: domain,
    pageID: page.pageid
  };
  try {
    return wikipage;
  } catch (e) {
    console.error(e);
    throw e
  }
};

//fetch and parse a random page from the api
const getRandom = function(a, b, c, d) {
  let {lang, domain, options, callback} = getParams(a, b, c, d);
  let url = makeUrl(lang);
  return new Promise(function(resolve, reject) {
    let p = request(url, options);
    p.then((res) => {
      return postProcess(res, lang, domain);
    }).then((doc) => {
      //support 'err-back' format
      if (typeof callback === 'function') {
        callback(null, doc);
      }
      resolve(doc);
    }).catch(reject);
  });
};
module.exports = getRandom;
