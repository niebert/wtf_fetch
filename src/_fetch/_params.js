
//allow quite! flexible params to fetch, category
// [lang], [options], [callback]
const getParams = function(a, b, c, d) {
  let options = {};
  let lang = 'en';
  let domain = 'wikipedia';
  let callback = null;
  if (typeof a === 'function') {
    callback = a;
  } else if (typeof a === 'object') {
    options = a;
  } else if (typeof a === 'string') {
    lang = a;
  }
  if (typeof b === 'function') {
    callback = b;
  } else if (typeof b === 'object') {
    options = b;
  } else if (typeof b === 'string') {
    domain = b;
  }
  if (typeof c === 'function') {
    callback = c;
  } else if (typeof c === 'object') {
    options = c;
  }
  if (typeof d === 'function') {
    callback = d;
  }
  let params = {
    "options": options,
    "lang": lang,
    "domain": domain,
    "callback": callback
  };
  // console.log("Call: getParams() params="+JSON.stringify(params,null,2));
  return params;
};
module.exports = getParams;
