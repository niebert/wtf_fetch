//grab the content of any article, off the api
const request = require('./_request');
//const makeUrl = require('./_url');
const makeUrl = require('./_url').title;
const getParams = require('./_params');
const title2url = require('./_title2url');

//num pages per request
const MAX_PAGES = 5;

// this data-format from mediawiki api is nutso
// domain="wikipedia" ("wikiversity", ...)
// lang="en"  ("de", "fr" ...)

const postProcess = function(data,lang,domain) {
  let pages = Object.keys(data.query.pages);
  let docs = pages.map(id => {
    let page = data.query.pages[id] || {};
    if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
      return null;
    }
    let text = page.revisions[0]['*'];
    //us the 'generator' result format, for the random() method
    if (!text && page.revisions[0].slots) {
      text = page.revisions[0].slots.main['*'];
    }
    let wikipage = {
      wiki: text,
      title: page.title,
      url: title2url(page.title),
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
  });
  return docs;
};

//recursive fn to fetch groups of pages, serially
const doPages = function(pages, results, lang, domain, options, cb) {
  let todo = pages.slice(0, MAX_PAGES);
  let url = makeUrl(todo, lang, domain, options);
  let p = request(url, options);
  p.then((wiki) => {
    let res = postProcess(wiki, lang, domain);
    results = results.concat(res);
    let remain = pages.slice(MAX_PAGES);
    if (remain.length > 0) {
      return doPages(remain, results, lang, domain, options, cb); //recursive
    }
    return cb(results);
  }).catch((e) => {
    console.error('wtf_fetch error: ' + e);
    cb(results);
  });
};

//grab a single, or list of pages (or ids)
const fetchPage = function( pages = [] , p1, p2, p3, p4) {
  if (typeof pages !== 'object') {
    pages = [pages];
  }
  if (typeof cb !== 'function') {
    console.log("CALL: fetchPage() - no callback defined!");
  } else {
    console.log("Callback is defined in fetchPage()-call!");
  };
  let {lang, domain, options, callback} = getParams(p1, p2, p3, p4);
  return new Promise(function(resolve, reject) {
    // courtesy-check for spamming wp servers
    if (pages.length > 500) {
      console.error('wtf_fetch error: Requested ' + pages.length + ' pages.');
      reject('Requested too many pages, exiting.');
      return;
    }
    doPages(pages, [], lang, domain, options, (docs) => {
      docs = docs.filter((d) => d !== null);
      //return the first doc, if we only asked for one
      if (pages.length === 1) {
        docs = docs[0];
      }
      docs = docs || null;
      //support 'err-back' format
      if (callback && typeof callback === 'function') {
        //console.log("Callback defined in Promise!\n"+callback+"\n docs="+JSON.stringify(docs,null,2));
        callback(null, docs);
      } else {
        // console.log("No callback defined in Promise!");
      }
      resolve(docs);
    });
  });
};

module.exports = fetchPage;
