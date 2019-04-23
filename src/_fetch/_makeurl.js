const site_map = require('../_data/site_map');
const isUrl = /^https?:\/\//;

function isArray(arr) {
  return arr.constructor.toString().indexOf('Array') > -1;
}

const getUrl_prefix = function(lang, domain) {
  domain = domain || "wikipedia";
  lang = lang || 'en';
  let url = `https://${lang}.${domain}.org/w/api.php`;
  if (site_map[lang]) {
    url = site_map[lang] + '/w/api.php';
  }
  return url;
}


const makeTitle = function( title = '' ) {
  //if given a url...
  if (isUrl.test(title) === true) {
    title = title.replace(/.*?\/wiki\//, '');
    title = title.replace(/\?.*/, '');
  }
  title = encodeURIComponent(title);
  return title;
};

const makeUrl_title = function(title, lang, domain, options) {
  domain = domain || "wikipedia";
  lang = lang || 'en';
  let url = getUrl_prefix(lang,domain);
  // set an alternative wiki URL;
  if (options.wikiUrl) {
    url = options.wikiUrl;
  }
  //we use the 'revisions' api here, instead of the Raw api, for its CORS-rules..
  url += '?action=query&prop=revisions&rvprop=content&maxlag=5&rvslots=main&format=json';
  if (!options.wikiUrl) {
    url += '&origin=*';
  }
  if (options.follow_redirects !== false) {
    url += '&redirects=true';
  }
  var lookup = 'titles';
  let pages = [];
  //support one, or many pages
  if (isArray(title) === false) {
    pages = [title];
  } else {
    pages = title;
  }
  //assume numbers mean pageid, and strings are titles (like '1984')
  if (typeof pages[0] === 'number') {
    lookup = 'pageids';
  } else {
    pages = pages.map(makeTitle);
  }
  pages = pages.filter((p) => p !== '');
  pages = pages.join('|');
  url += '&' + lookup + '=' + pages;
  return url;
};

const makeUrl_random = function(lang,domain) {
  // set default values for parameters
  domain = domain || "wikipedia";
  lang = lang || "en";
  let url = getUrl_prefix(lang,domain);
  url += `?format=json&action=query&generator=random&grnnamespace=0&prop=revisions&rvprop=content&grnlimit=1&rvslots=main&origin=*`;
  return url;
};


const makeUrl_category = function(cat, lang, domain) {
  cat = encodeURIComponent(cat);
  let url = getUrl_prefix(lang,domain);
  url += `?action=query&list=categorymembers&cmtitle=${cat}&cmlimit=500&format=json&origin=*&redirects=true&cmtype=page|subcat`;
  return url;
};

let makeUrl = {
  title: makeUrl_title,
  random: makeUrl_random,
  category: makeUrl_category
};

module.exports = makeUrl;
