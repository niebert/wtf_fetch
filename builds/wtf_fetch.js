/* wtf_fetch v1.7.0
   github.com/niebert/wtf_fetch

   Fetch Wiki markdown from MediaWiki
   based on work of Spencer Kelly github.com/spencermountain/wtf_wikipedia
   designed as submodule of wtf_wikipedia - decomposition into subtasks
   Licence: MIT
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wtf_fetch = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
var __root__ = (function (root) {
function F() { this.fetch = false; }
F.prototype = root;
return new F();
})(typeof self !== 'undefined' ? self : this);
(function(self) {

(function(self) {

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    };

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue+','+value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) { items.push(name); });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) { items.push(value); });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) { items.push([name, value]); });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);
      var xhr = new XMLHttpRequest();

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : this);
}).call(__root__, void(0));
var fetch = __root__.fetch;
var Response = fetch.Response = __root__.Response;
var Request = fetch.Request = __root__.Request;
var Headers = fetch.Headers = __root__.Headers;
if (typeof module === 'object' && module.exports) {
module.exports = fetch;
// Needed for TypeScript consumers without esModuleInterop.
module.exports.default = fetch;
}

},{}],2:[function(_dereq_,module,exports){
"use strict";

//from https://en.wikipedia.org/w/api.php?action=sitematrix&format=json
var site_map = {
  aawiki: 'https://aa.wikipedia.org',
  aawikipedia: 'https://aa.wikipedia.org',
  aawiktionary: 'https://aa.wiktionary.org',
  aawikibooks: 'https://aa.wikibooks.org',
  abwiki: 'https://ab.wikipedia.org',
  abwikipedia: 'https://ab.wikipedia.org',
  abwiktionary: 'https://ab.wiktionary.org',
  acewiki: 'https://ace.wikipedia.org',
  acewikipedia: 'https://ace.wikipedia.org',
  adywiki: 'https://ady.wikipedia.org',
  adywikipedia: 'https://ady.wikipedia.org',
  afwiki: 'https://af.wikipedia.org',
  afwikipedia: 'https://af.wikipedia.org',
  afwiktionary: 'https://af.wiktionary.org',
  afwikibooks: 'https://af.wikibooks.org',
  afwikiquote: 'https://af.wikiquote.org',
  akwiki: 'https://ak.wikipedia.org',
  akwikipedia: 'https://ak.wikipedia.org',
  akwiktionary: 'https://ak.wiktionary.org',
  akwikibooks: 'https://ak.wikibooks.org',
  alswiki: 'https://als.wikipedia.org',
  alswikipedia: 'https://als.wikipedia.org',
  amwiki: 'https://am.wikipedia.org',
  amwikipedia: 'https://am.wikipedia.org',
  amwiktionary: 'https://am.wiktionary.org',
  amwikiquote: 'https://am.wikiquote.org',
  anwiki: 'https://an.wikipedia.org',
  anwikipedia: 'https://an.wikipedia.org',
  anwiktionary: 'https://an.wiktionary.org',
  angwiki: 'https://ang.wikipedia.org',
  angwikipedia: 'https://ang.wikipedia.org',
  angwiktionary: 'https://ang.wiktionary.org',
  angwikibooks: 'https://ang.wikibooks.org',
  angwikiquote: 'https://ang.wikiquote.org',
  angwikisource: 'https://ang.wikisource.org',
  arwiki: 'https://ar.wikipedia.org',
  arwikipedia: 'https://ar.wikipedia.org',
  arwiktionary: 'https://ar.wiktionary.org',
  arwikibooks: 'https://ar.wikibooks.org',
  arwikinews: 'https://ar.wikinews.org',
  arwikiquote: 'https://ar.wikiquote.org',
  arwikisource: 'https://ar.wikisource.org',
  arwikiversity: 'https://ar.wikiversity.org',
  arcwiki: 'https://arc.wikipedia.org',
  arcwikipedia: 'https://arc.wikipedia.org',
  arzwiki: 'https://arz.wikipedia.org',
  arzwikipedia: 'https://arz.wikipedia.org',
  aswiki: 'https://as.wikipedia.org',
  aswikipedia: 'https://as.wikipedia.org',
  aswiktionary: 'https://as.wiktionary.org',
  aswikibooks: 'https://as.wikibooks.org',
  aswikisource: 'https://as.wikisource.org',
  astwiki: 'https://ast.wikipedia.org',
  astwikipedia: 'https://ast.wikipedia.org',
  astwiktionary: 'https://ast.wiktionary.org',
  astwikibooks: 'https://ast.wikibooks.org',
  astwikiquote: 'https://ast.wikiquote.org',
  atjwiki: 'https://atj.wikipedia.org',
  atjwikipedia: 'https://atj.wikipedia.org',
  avwiki: 'https://av.wikipedia.org',
  avwikipedia: 'https://av.wikipedia.org',
  avwiktionary: 'https://av.wiktionary.org',
  aywiki: 'https://ay.wikipedia.org',
  aywikipedia: 'https://ay.wikipedia.org',
  aywiktionary: 'https://ay.wiktionary.org',
  aywikibooks: 'https://ay.wikibooks.org',
  azwiki: 'https://az.wikipedia.org',
  azwikipedia: 'https://az.wikipedia.org',
  azwiktionary: 'https://az.wiktionary.org',
  azwikibooks: 'https://az.wikibooks.org',
  azwikiquote: 'https://az.wikiquote.org',
  azwikisource: 'https://az.wikisource.org',
  azbwiki: 'https://azb.wikipedia.org',
  azbwikipedia: 'https://azb.wikipedia.org',
  bawiki: 'https://ba.wikipedia.org',
  bawikipedia: 'https://ba.wikipedia.org',
  bawikibooks: 'https://ba.wikibooks.org',
  barwiki: 'https://bar.wikipedia.org',
  barwikipedia: 'https://bar.wikipedia.org',
  bat_smgwiki: 'https://bat-smg.wikipedia.org',
  bat_smgwikipedia: 'https://bat-smg.wikipedia.org',
  bclwiki: 'https://bcl.wikipedia.org',
  bclwikipedia: 'https://bcl.wikipedia.org',
  bewiki: 'https://be.wikipedia.org',
  bewikipedia: 'https://be.wikipedia.org',
  bewiktionary: 'https://be.wiktionary.org',
  bewikibooks: 'https://be.wikibooks.org',
  bewikiquote: 'https://be.wikiquote.org',
  bewikisource: 'https://be.wikisource.org',
  be_x_oldwiki: 'https://be-tarask.wikipedia.org',
  be_x_oldwikipedia: 'https://be-tarask.wikipedia.org',
  bgwiki: 'https://bg.wikipedia.org',
  bgwikipedia: 'https://bg.wikipedia.org',
  bgwiktionary: 'https://bg.wiktionary.org',
  bgwikibooks: 'https://bg.wikibooks.org',
  bgwikinews: 'https://bg.wikinews.org',
  bgwikiquote: 'https://bg.wikiquote.org',
  bgwikisource: 'https://bg.wikisource.org',
  bhwiki: 'https://bh.wikipedia.org',
  bhwikipedia: 'https://bh.wikipedia.org',
  bhwiktionary: 'https://bh.wiktionary.org',
  biwiki: 'https://bi.wikipedia.org',
  biwikipedia: 'https://bi.wikipedia.org',
  biwiktionary: 'https://bi.wiktionary.org',
  biwikibooks: 'https://bi.wikibooks.org',
  bjnwiki: 'https://bjn.wikipedia.org',
  bjnwikipedia: 'https://bjn.wikipedia.org',
  bmwiki: 'https://bm.wikipedia.org',
  bmwikipedia: 'https://bm.wikipedia.org',
  bmwiktionary: 'https://bm.wiktionary.org',
  bmwikibooks: 'https://bm.wikibooks.org',
  bmwikiquote: 'https://bm.wikiquote.org',
  bnwiki: 'https://bn.wikipedia.org',
  bnwikipedia: 'https://bn.wikipedia.org',
  bnwiktionary: 'https://bn.wiktionary.org',
  bnwikibooks: 'https://bn.wikibooks.org',
  bnwikisource: 'https://bn.wikisource.org',
  bnwikivoyage: 'https://bn.wikivoyage.org',
  bowiki: 'https://bo.wikipedia.org',
  bowikipedia: 'https://bo.wikipedia.org',
  bowiktionary: 'https://bo.wiktionary.org',
  bowikibooks: 'https://bo.wikibooks.org',
  bpywiki: 'https://bpy.wikipedia.org',
  bpywikipedia: 'https://bpy.wikipedia.org',
  brwiki: 'https://br.wikipedia.org',
  brwikipedia: 'https://br.wikipedia.org',
  brwiktionary: 'https://br.wiktionary.org',
  brwikiquote: 'https://br.wikiquote.org',
  brwikisource: 'https://br.wikisource.org',
  bswiki: 'https://bs.wikipedia.org',
  bswikipedia: 'https://bs.wikipedia.org',
  bswiktionary: 'https://bs.wiktionary.org',
  bswikibooks: 'https://bs.wikibooks.org',
  bswikinews: 'https://bs.wikinews.org',
  bswikiquote: 'https://bs.wikiquote.org',
  bswikisource: 'https://bs.wikisource.org',
  bugwiki: 'https://bug.wikipedia.org',
  bugwikipedia: 'https://bug.wikipedia.org',
  bxrwiki: 'https://bxr.wikipedia.org',
  bxrwikipedia: 'https://bxr.wikipedia.org',
  cawiki: 'https://ca.wikipedia.org',
  cawikipedia: 'https://ca.wikipedia.org',
  cawiktionary: 'https://ca.wiktionary.org',
  cawikibooks: 'https://ca.wikibooks.org',
  cawikinews: 'https://ca.wikinews.org',
  cawikiquote: 'https://ca.wikiquote.org',
  cawikisource: 'https://ca.wikisource.org',
  cbk_zamwiki: 'https://cbk-zam.wikipedia.org',
  cbk_zamwikipedia: 'https://cbk-zam.wikipedia.org',
  cdowiki: 'https://cdo.wikipedia.org',
  cdowikipedia: 'https://cdo.wikipedia.org',
  cewiki: 'https://ce.wikipedia.org',
  cewikipedia: 'https://ce.wikipedia.org',
  cebwiki: 'https://ceb.wikipedia.org',
  cebwikipedia: 'https://ceb.wikipedia.org',
  chwiki: 'https://ch.wikipedia.org',
  chwikipedia: 'https://ch.wikipedia.org',
  chwiktionary: 'https://ch.wiktionary.org',
  chwikibooks: 'https://ch.wikibooks.org',
  chowiki: 'https://cho.wikipedia.org',
  chowikipedia: 'https://cho.wikipedia.org',
  chrwiki: 'https://chr.wikipedia.org',
  chrwikipedia: 'https://chr.wikipedia.org',
  chrwiktionary: 'https://chr.wiktionary.org',
  chywiki: 'https://chy.wikipedia.org',
  chywikipedia: 'https://chy.wikipedia.org',
  ckbwiki: 'https://ckb.wikipedia.org',
  ckbwikipedia: 'https://ckb.wikipedia.org',
  cowiki: 'https://co.wikipedia.org',
  cowikipedia: 'https://co.wikipedia.org',
  cowiktionary: 'https://co.wiktionary.org',
  cowikibooks: 'https://co.wikibooks.org',
  cowikiquote: 'https://co.wikiquote.org',
  crwiki: 'https://cr.wikipedia.org',
  crwikipedia: 'https://cr.wikipedia.org',
  crwiktionary: 'https://cr.wiktionary.org',
  crwikiquote: 'https://cr.wikiquote.org',
  crhwiki: 'https://crh.wikipedia.org',
  crhwikipedia: 'https://crh.wikipedia.org',
  cswiki: 'https://cs.wikipedia.org',
  cswikipedia: 'https://cs.wikipedia.org',
  cswiktionary: 'https://cs.wiktionary.org',
  cswikibooks: 'https://cs.wikibooks.org',
  cswikinews: 'https://cs.wikinews.org',
  cswikiquote: 'https://cs.wikiquote.org',
  cswikisource: 'https://cs.wikisource.org',
  cswikiversity: 'https://cs.wikiversity.org',
  csbwiki: 'https://csb.wikipedia.org',
  csbwikipedia: 'https://csb.wikipedia.org',
  csbwiktionary: 'https://csb.wiktionary.org',
  cuwiki: 'https://cu.wikipedia.org',
  cuwikipedia: 'https://cu.wikipedia.org',
  cvwiki: 'https://cv.wikipedia.org',
  cvwikipedia: 'https://cv.wikipedia.org',
  cvwikibooks: 'https://cv.wikibooks.org',
  cywiki: 'https://cy.wikipedia.org',
  cywikipedia: 'https://cy.wikipedia.org',
  cywiktionary: 'https://cy.wiktionary.org',
  cywikibooks: 'https://cy.wikibooks.org',
  cywikiquote: 'https://cy.wikiquote.org',
  cywikisource: 'https://cy.wikisource.org',
  dawiki: 'https://da.wikipedia.org',
  dawikipedia: 'https://da.wikipedia.org',
  dawiktionary: 'https://da.wiktionary.org',
  dawikibooks: 'https://da.wikibooks.org',
  dawikiquote: 'https://da.wikiquote.org',
  dawikisource: 'https://da.wikisource.org',
  dewiki: 'https://de.wikipedia.org',
  dewikipedia: 'https://de.wikipedia.org',
  dewiktionary: 'https://de.wiktionary.org',
  dewikibooks: 'https://de.wikibooks.org',
  dewikinews: 'https://de.wikinews.org',
  dewikiquote: 'https://de.wikiquote.org',
  dewikisource: 'https://de.wikisource.org',
  dewikiversity: 'https://de.wikiversity.org',
  dewikivoyage: 'https://de.wikivoyage.org',
  dinwiki: 'https://din.wikipedia.org',
  dinwikipedia: 'https://din.wikipedia.org',
  diqwiki: 'https://diq.wikipedia.org',
  diqwikipedia: 'https://diq.wikipedia.org',
  dsbwiki: 'https://dsb.wikipedia.org',
  dsbwikipedia: 'https://dsb.wikipedia.org',
  dtywiki: 'https://dty.wikipedia.org',
  dtywikipedia: 'https://dty.wikipedia.org',
  dvwiki: 'https://dv.wikipedia.org',
  dvwikipedia: 'https://dv.wikipedia.org',
  dvwiktionary: 'https://dv.wiktionary.org',
  dzwiki: 'https://dz.wikipedia.org',
  dzwikipedia: 'https://dz.wikipedia.org',
  dzwiktionary: 'https://dz.wiktionary.org',
  eewiki: 'https://ee.wikipedia.org',
  eewikipedia: 'https://ee.wikipedia.org',
  elwiki: 'https://el.wikipedia.org',
  elwikipedia: 'https://el.wikipedia.org',
  elwiktionary: 'https://el.wiktionary.org',
  elwikibooks: 'https://el.wikibooks.org',
  elwikinews: 'https://el.wikinews.org',
  elwikiquote: 'https://el.wikiquote.org',
  elwikisource: 'https://el.wikisource.org',
  elwikiversity: 'https://el.wikiversity.org',
  elwikivoyage: 'https://el.wikivoyage.org',
  emlwiki: 'https://eml.wikipedia.org',
  emlwikipedia: 'https://eml.wikipedia.org',
  enwiki: 'https://en.wikipedia.org',
  enwikipedia: 'https://en.wikipedia.org',
  enwiktionary: 'https://en.wiktionary.org',
  enwikibooks: 'https://en.wikibooks.org',
  enwikinews: 'https://en.wikinews.org',
  enwikiquote: 'https://en.wikiquote.org',
  enwikisource: 'https://en.wikisource.org',
  enwikiversity: 'https://en.wikiversity.org',
  enwikivoyage: 'https://en.wikivoyage.org',
  eowiki: 'https://eo.wikipedia.org',
  eowikipedia: 'https://eo.wikipedia.org',
  eowiktionary: 'https://eo.wiktionary.org',
  eowikibooks: 'https://eo.wikibooks.org',
  eowikinews: 'https://eo.wikinews.org',
  eowikiquote: 'https://eo.wikiquote.org',
  eowikisource: 'https://eo.wikisource.org',
  eswiki: 'https://es.wikipedia.org',
  eswikipedia: 'https://es.wikipedia.org',
  eswiktionary: 'https://es.wiktionary.org',
  eswikibooks: 'https://es.wikibooks.org',
  eswikinews: 'https://es.wikinews.org',
  eswikiquote: 'https://es.wikiquote.org',
  eswikisource: 'https://es.wikisource.org',
  eswikiversity: 'https://es.wikiversity.org',
  eswikivoyage: 'https://es.wikivoyage.org',
  etwiki: 'https://et.wikipedia.org',
  etwikipedia: 'https://et.wikipedia.org',
  etwiktionary: 'https://et.wiktionary.org',
  etwikibooks: 'https://et.wikibooks.org',
  etwikiquote: 'https://et.wikiquote.org',
  etwikisource: 'https://et.wikisource.org',
  euwiki: 'https://eu.wikipedia.org',
  euwikipedia: 'https://eu.wikipedia.org',
  euwiktionary: 'https://eu.wiktionary.org',
  euwikibooks: 'https://eu.wikibooks.org',
  euwikiquote: 'https://eu.wikiquote.org',
  euwikisource: 'https://eu.wikisource.org',
  extwiki: 'https://ext.wikipedia.org',
  extwikipedia: 'https://ext.wikipedia.org',
  fawiki: 'https://fa.wikipedia.org',
  fawikipedia: 'https://fa.wikipedia.org',
  fawiktionary: 'https://fa.wiktionary.org',
  fawikibooks: 'https://fa.wikibooks.org',
  fawikinews: 'https://fa.wikinews.org',
  fawikiquote: 'https://fa.wikiquote.org',
  fawikisource: 'https://fa.wikisource.org',
  fawikivoyage: 'https://fa.wikivoyage.org',
  ffwiki: 'https://ff.wikipedia.org',
  ffwikipedia: 'https://ff.wikipedia.org',
  fiwiki: 'https://fi.wikipedia.org',
  fiwikipedia: 'https://fi.wikipedia.org',
  fiwiktionary: 'https://fi.wiktionary.org',
  fiwikibooks: 'https://fi.wikibooks.org',
  fiwikinews: 'https://fi.wikinews.org',
  fiwikiquote: 'https://fi.wikiquote.org',
  fiwikisource: 'https://fi.wikisource.org',
  fiwikiversity: 'https://fi.wikiversity.org',
  fiwikivoyage: 'https://fi.wikivoyage.org',
  fiu_vrowiki: 'https://fiu-vro.wikipedia.org',
  fiu_vrowikipedia: 'https://fiu-vro.wikipedia.org',
  fjwiki: 'https://fj.wikipedia.org',
  fjwikipedia: 'https://fj.wikipedia.org',
  fjwiktionary: 'https://fj.wiktionary.org',
  fowiki: 'https://fo.wikipedia.org',
  fowikipedia: 'https://fo.wikipedia.org',
  fowiktionary: 'https://fo.wiktionary.org',
  fowikisource: 'https://fo.wikisource.org',
  frwiki: 'https://fr.wikipedia.org',
  frwikipedia: 'https://fr.wikipedia.org',
  frwiktionary: 'https://fr.wiktionary.org',
  frwikibooks: 'https://fr.wikibooks.org',
  frwikinews: 'https://fr.wikinews.org',
  frwikiquote: 'https://fr.wikiquote.org',
  frwikisource: 'https://fr.wikisource.org',
  frwikiversity: 'https://fr.wikiversity.org',
  frwikivoyage: 'https://fr.wikivoyage.org',
  frpwiki: 'https://frp.wikipedia.org',
  frpwikipedia: 'https://frp.wikipedia.org',
  frrwiki: 'https://frr.wikipedia.org',
  frrwikipedia: 'https://frr.wikipedia.org',
  furwiki: 'https://fur.wikipedia.org',
  furwikipedia: 'https://fur.wikipedia.org',
  fywiki: 'https://fy.wikipedia.org',
  fywikipedia: 'https://fy.wikipedia.org',
  fywiktionary: 'https://fy.wiktionary.org',
  fywikibooks: 'https://fy.wikibooks.org',
  gawiki: 'https://ga.wikipedia.org',
  gawikipedia: 'https://ga.wikipedia.org',
  gawiktionary: 'https://ga.wiktionary.org',
  gawikibooks: 'https://ga.wikibooks.org',
  gawikiquote: 'https://ga.wikiquote.org',
  gagwiki: 'https://gag.wikipedia.org',
  gagwikipedia: 'https://gag.wikipedia.org',
  ganwiki: 'https://gan.wikipedia.org',
  ganwikipedia: 'https://gan.wikipedia.org',
  gdwiki: 'https://gd.wikipedia.org',
  gdwikipedia: 'https://gd.wikipedia.org',
  gdwiktionary: 'https://gd.wiktionary.org',
  glwiki: 'https://gl.wikipedia.org',
  glwikipedia: 'https://gl.wikipedia.org',
  glwiktionary: 'https://gl.wiktionary.org',
  glwikibooks: 'https://gl.wikibooks.org',
  glwikiquote: 'https://gl.wikiquote.org',
  glwikisource: 'https://gl.wikisource.org',
  glkwiki: 'https://glk.wikipedia.org',
  glkwikipedia: 'https://glk.wikipedia.org',
  gnwiki: 'https://gn.wikipedia.org',
  gnwikipedia: 'https://gn.wikipedia.org',
  gnwiktionary: 'https://gn.wiktionary.org',
  gnwikibooks: 'https://gn.wikibooks.org',
  gomwiki: 'https://gom.wikipedia.org',
  gomwikipedia: 'https://gom.wikipedia.org',
  gorwiki: 'https://gor.wikipedia.org',
  gorwikipedia: 'https://gor.wikipedia.org',
  gotwiki: 'https://got.wikipedia.org',
  gotwikipedia: 'https://got.wikipedia.org',
  gotwikibooks: 'https://got.wikibooks.org',
  guwiki: 'https://gu.wikipedia.org',
  guwikipedia: 'https://gu.wikipedia.org',
  guwiktionary: 'https://gu.wiktionary.org',
  guwikibooks: 'https://gu.wikibooks.org',
  guwikiquote: 'https://gu.wikiquote.org',
  guwikisource: 'https://gu.wikisource.org',
  gvwiki: 'https://gv.wikipedia.org',
  gvwikipedia: 'https://gv.wikipedia.org',
  gvwiktionary: 'https://gv.wiktionary.org',
  hawiki: 'https://ha.wikipedia.org',
  hawikipedia: 'https://ha.wikipedia.org',
  hawiktionary: 'https://ha.wiktionary.org',
  hakwiki: 'https://hak.wikipedia.org',
  hakwikipedia: 'https://hak.wikipedia.org',
  hawwiki: 'https://haw.wikipedia.org',
  hawwikipedia: 'https://haw.wikipedia.org',
  hewiki: 'https://he.wikipedia.org',
  hewikipedia: 'https://he.wikipedia.org',
  hewiktionary: 'https://he.wiktionary.org',
  hewikibooks: 'https://he.wikibooks.org',
  hewikinews: 'https://he.wikinews.org',
  hewikiquote: 'https://he.wikiquote.org',
  hewikisource: 'https://he.wikisource.org',
  hewikivoyage: 'https://he.wikivoyage.org',
  hiwiki: 'https://hi.wikipedia.org',
  hiwikipedia: 'https://hi.wikipedia.org',
  hiwiktionary: 'https://hi.wiktionary.org',
  hiwikibooks: 'https://hi.wikibooks.org',
  hiwikiquote: 'https://hi.wikiquote.org',
  hiwikiversity: 'https://hi.wikiversity.org',
  hiwikivoyage: 'https://hi.wikivoyage.org',
  hifwiki: 'https://hif.wikipedia.org',
  hifwikipedia: 'https://hif.wikipedia.org',
  hifwiktionary: 'https://hif.wiktionary.org',
  howiki: 'https://ho.wikipedia.org',
  howikipedia: 'https://ho.wikipedia.org',
  hrwiki: 'https://hr.wikipedia.org',
  hrwikipedia: 'https://hr.wikipedia.org',
  hrwiktionary: 'https://hr.wiktionary.org',
  hrwikibooks: 'https://hr.wikibooks.org',
  hrwikiquote: 'https://hr.wikiquote.org',
  hrwikisource: 'https://hr.wikisource.org',
  hsbwiki: 'https://hsb.wikipedia.org',
  hsbwikipedia: 'https://hsb.wikipedia.org',
  hsbwiktionary: 'https://hsb.wiktionary.org',
  htwiki: 'https://ht.wikipedia.org',
  htwikipedia: 'https://ht.wikipedia.org',
  htwikisource: 'https://ht.wikisource.org',
  huwiki: 'https://hu.wikipedia.org',
  huwikipedia: 'https://hu.wikipedia.org',
  huwiktionary: 'https://hu.wiktionary.org',
  huwikibooks: 'https://hu.wikibooks.org',
  huwikinews: 'https://hu.wikinews.org',
  huwikiquote: 'https://hu.wikiquote.org',
  huwikisource: 'https://hu.wikisource.org',
  hywiki: 'https://hy.wikipedia.org',
  hywikipedia: 'https://hy.wikipedia.org',
  hywiktionary: 'https://hy.wiktionary.org',
  hywikibooks: 'https://hy.wikibooks.org',
  hywikiquote: 'https://hy.wikiquote.org',
  hywikisource: 'https://hy.wikisource.org',
  hzwiki: 'https://hz.wikipedia.org',
  hzwikipedia: 'https://hz.wikipedia.org',
  iawiki: 'https://ia.wikipedia.org',
  iawikipedia: 'https://ia.wikipedia.org',
  iawiktionary: 'https://ia.wiktionary.org',
  iawikibooks: 'https://ia.wikibooks.org',
  idwiki: 'https://id.wikipedia.org',
  idwikipedia: 'https://id.wikipedia.org',
  idwiktionary: 'https://id.wiktionary.org',
  idwikibooks: 'https://id.wikibooks.org',
  idwikiquote: 'https://id.wikiquote.org',
  idwikisource: 'https://id.wikisource.org',
  iewiki: 'https://ie.wikipedia.org',
  iewikipedia: 'https://ie.wikipedia.org',
  iewiktionary: 'https://ie.wiktionary.org',
  iewikibooks: 'https://ie.wikibooks.org',
  igwiki: 'https://ig.wikipedia.org',
  igwikipedia: 'https://ig.wikipedia.org',
  iiwiki: 'https://ii.wikipedia.org',
  iiwikipedia: 'https://ii.wikipedia.org',
  ikwiki: 'https://ik.wikipedia.org',
  ikwikipedia: 'https://ik.wikipedia.org',
  ikwiktionary: 'https://ik.wiktionary.org',
  ilowiki: 'https://ilo.wikipedia.org',
  ilowikipedia: 'https://ilo.wikipedia.org',
  inhwiki: 'https://inh.wikipedia.org',
  inhwikipedia: 'https://inh.wikipedia.org',
  iowiki: 'https://io.wikipedia.org',
  iowikipedia: 'https://io.wikipedia.org',
  iowiktionary: 'https://io.wiktionary.org',
  iswiki: 'https://is.wikipedia.org',
  iswikipedia: 'https://is.wikipedia.org',
  iswiktionary: 'https://is.wiktionary.org',
  iswikibooks: 'https://is.wikibooks.org',
  iswikiquote: 'https://is.wikiquote.org',
  iswikisource: 'https://is.wikisource.org',
  itwiki: 'https://it.wikipedia.org',
  itwikipedia: 'https://it.wikipedia.org',
  itwiktionary: 'https://it.wiktionary.org',
  itwikibooks: 'https://it.wikibooks.org',
  itwikinews: 'https://it.wikinews.org',
  itwikiquote: 'https://it.wikiquote.org',
  itwikisource: 'https://it.wikisource.org',
  itwikiversity: 'https://it.wikiversity.org',
  itwikivoyage: 'https://it.wikivoyage.org',
  iuwiki: 'https://iu.wikipedia.org',
  iuwikipedia: 'https://iu.wikipedia.org',
  iuwiktionary: 'https://iu.wiktionary.org',
  jawiki: 'https://ja.wikipedia.org',
  jawikipedia: 'https://ja.wikipedia.org',
  jawiktionary: 'https://ja.wiktionary.org',
  jawikibooks: 'https://ja.wikibooks.org',
  jawikinews: 'https://ja.wikinews.org',
  jawikiquote: 'https://ja.wikiquote.org',
  jawikisource: 'https://ja.wikisource.org',
  jawikiversity: 'https://ja.wikiversity.org',
  jamwiki: 'https://jam.wikipedia.org',
  jamwikipedia: 'https://jam.wikipedia.org',
  jbowiki: 'https://jbo.wikipedia.org',
  jbowikipedia: 'https://jbo.wikipedia.org',
  jbowiktionary: 'https://jbo.wiktionary.org',
  jvwiki: 'https://jv.wikipedia.org',
  jvwikipedia: 'https://jv.wikipedia.org',
  jvwiktionary: 'https://jv.wiktionary.org',
  kawiki: 'https://ka.wikipedia.org',
  kawikipedia: 'https://ka.wikipedia.org',
  kawiktionary: 'https://ka.wiktionary.org',
  kawikibooks: 'https://ka.wikibooks.org',
  kawikiquote: 'https://ka.wikiquote.org',
  kaawiki: 'https://kaa.wikipedia.org',
  kaawikipedia: 'https://kaa.wikipedia.org',
  kabwiki: 'https://kab.wikipedia.org',
  kabwikipedia: 'https://kab.wikipedia.org',
  kbdwiki: 'https://kbd.wikipedia.org',
  kbdwikipedia: 'https://kbd.wikipedia.org',
  kbpwiki: 'https://kbp.wikipedia.org',
  kbpwikipedia: 'https://kbp.wikipedia.org',
  kgwiki: 'https://kg.wikipedia.org',
  kgwikipedia: 'https://kg.wikipedia.org',
  kiwiki: 'https://ki.wikipedia.org',
  kiwikipedia: 'https://ki.wikipedia.org',
  kjwiki: 'https://kj.wikipedia.org',
  kjwikipedia: 'https://kj.wikipedia.org',
  kkwiki: 'https://kk.wikipedia.org',
  kkwikipedia: 'https://kk.wikipedia.org',
  kkwiktionary: 'https://kk.wiktionary.org',
  kkwikibooks: 'https://kk.wikibooks.org',
  kkwikiquote: 'https://kk.wikiquote.org',
  klwiki: 'https://kl.wikipedia.org',
  klwikipedia: 'https://kl.wikipedia.org',
  klwiktionary: 'https://kl.wiktionary.org',
  kmwiki: 'https://km.wikipedia.org',
  kmwikipedia: 'https://km.wikipedia.org',
  kmwiktionary: 'https://km.wiktionary.org',
  kmwikibooks: 'https://km.wikibooks.org',
  knwiki: 'https://kn.wikipedia.org',
  knwikipedia: 'https://kn.wikipedia.org',
  knwiktionary: 'https://kn.wiktionary.org',
  knwikibooks: 'https://kn.wikibooks.org',
  knwikiquote: 'https://kn.wikiquote.org',
  knwikisource: 'https://kn.wikisource.org',
  kowiki: 'https://ko.wikipedia.org',
  kowikipedia: 'https://ko.wikipedia.org',
  kowiktionary: 'https://ko.wiktionary.org',
  kowikibooks: 'https://ko.wikibooks.org',
  kowikinews: 'https://ko.wikinews.org',
  kowikiquote: 'https://ko.wikiquote.org',
  kowikisource: 'https://ko.wikisource.org',
  kowikiversity: 'https://ko.wikiversity.org',
  koiwiki: 'https://koi.wikipedia.org',
  koiwikipedia: 'https://koi.wikipedia.org',
  krwiki: 'https://kr.wikipedia.org',
  krwikipedia: 'https://kr.wikipedia.org',
  krwikiquote: 'https://kr.wikiquote.org',
  krcwiki: 'https://krc.wikipedia.org',
  krcwikipedia: 'https://krc.wikipedia.org',
  kswiki: 'https://ks.wikipedia.org',
  kswikipedia: 'https://ks.wikipedia.org',
  kswiktionary: 'https://ks.wiktionary.org',
  kswikibooks: 'https://ks.wikibooks.org',
  kswikiquote: 'https://ks.wikiquote.org',
  kshwiki: 'https://ksh.wikipedia.org',
  kshwikipedia: 'https://ksh.wikipedia.org',
  kuwiki: 'https://ku.wikipedia.org',
  kuwikipedia: 'https://ku.wikipedia.org',
  kuwiktionary: 'https://ku.wiktionary.org',
  kuwikibooks: 'https://ku.wikibooks.org',
  kuwikiquote: 'https://ku.wikiquote.org',
  kvwiki: 'https://kv.wikipedia.org',
  kvwikipedia: 'https://kv.wikipedia.org',
  kwwiki: 'https://kw.wikipedia.org',
  kwwikipedia: 'https://kw.wikipedia.org',
  kwwiktionary: 'https://kw.wiktionary.org',
  kwwikiquote: 'https://kw.wikiquote.org',
  kywiki: 'https://ky.wikipedia.org',
  kywikipedia: 'https://ky.wikipedia.org',
  kywiktionary: 'https://ky.wiktionary.org',
  kywikibooks: 'https://ky.wikibooks.org',
  kywikiquote: 'https://ky.wikiquote.org',
  lawiki: 'https://la.wikipedia.org',
  lawikipedia: 'https://la.wikipedia.org',
  lawiktionary: 'https://la.wiktionary.org',
  lawikibooks: 'https://la.wikibooks.org',
  lawikiquote: 'https://la.wikiquote.org',
  lawikisource: 'https://la.wikisource.org',
  ladwiki: 'https://lad.wikipedia.org',
  ladwikipedia: 'https://lad.wikipedia.org',
  lbwiki: 'https://lb.wikipedia.org',
  lbwikipedia: 'https://lb.wikipedia.org',
  lbwiktionary: 'https://lb.wiktionary.org',
  lbwikibooks: 'https://lb.wikibooks.org',
  lbwikiquote: 'https://lb.wikiquote.org',
  lbewiki: 'https://lbe.wikipedia.org',
  lbewikipedia: 'https://lbe.wikipedia.org',
  lezwiki: 'https://lez.wikipedia.org',
  lezwikipedia: 'https://lez.wikipedia.org',
  lfnwiki: 'https://lfn.wikipedia.org',
  lfnwikipedia: 'https://lfn.wikipedia.org',
  lgwiki: 'https://lg.wikipedia.org',
  lgwikipedia: 'https://lg.wikipedia.org',
  liwiki: 'https://li.wikipedia.org',
  liwikipedia: 'https://li.wikipedia.org',
  liwiktionary: 'https://li.wiktionary.org',
  liwikibooks: 'https://li.wikibooks.org',
  liwikiquote: 'https://li.wikiquote.org',
  liwikisource: 'https://li.wikisource.org',
  lijwiki: 'https://lij.wikipedia.org',
  lijwikipedia: 'https://lij.wikipedia.org',
  lmowiki: 'https://lmo.wikipedia.org',
  lmowikipedia: 'https://lmo.wikipedia.org',
  lnwiki: 'https://ln.wikipedia.org',
  lnwikipedia: 'https://ln.wikipedia.org',
  lnwiktionary: 'https://ln.wiktionary.org',
  lnwikibooks: 'https://ln.wikibooks.org',
  lowiki: 'https://lo.wikipedia.org',
  lowikipedia: 'https://lo.wikipedia.org',
  lowiktionary: 'https://lo.wiktionary.org',
  lrcwiki: 'https://lrc.wikipedia.org',
  lrcwikipedia: 'https://lrc.wikipedia.org',
  ltwiki: 'https://lt.wikipedia.org',
  ltwikipedia: 'https://lt.wikipedia.org',
  ltwiktionary: 'https://lt.wiktionary.org',
  ltwikibooks: 'https://lt.wikibooks.org',
  ltwikiquote: 'https://lt.wikiquote.org',
  ltwikisource: 'https://lt.wikisource.org',
  ltgwiki: 'https://ltg.wikipedia.org',
  ltgwikipedia: 'https://ltg.wikipedia.org',
  lvwiki: 'https://lv.wikipedia.org',
  lvwikipedia: 'https://lv.wikipedia.org',
  lvwiktionary: 'https://lv.wiktionary.org',
  lvwikibooks: 'https://lv.wikibooks.org',
  maiwiki: 'https://mai.wikipedia.org',
  maiwikipedia: 'https://mai.wikipedia.org',
  map_bmswiki: 'https://map-bms.wikipedia.org',
  map_bmswikipedia: 'https://map-bms.wikipedia.org',
  mdfwiki: 'https://mdf.wikipedia.org',
  mdfwikipedia: 'https://mdf.wikipedia.org',
  mgwiki: 'https://mg.wikipedia.org',
  mgwikipedia: 'https://mg.wikipedia.org',
  mgwiktionary: 'https://mg.wiktionary.org',
  mgwikibooks: 'https://mg.wikibooks.org',
  mhwiki: 'https://mh.wikipedia.org',
  mhwikipedia: 'https://mh.wikipedia.org',
  mhwiktionary: 'https://mh.wiktionary.org',
  mhrwiki: 'https://mhr.wikipedia.org',
  mhrwikipedia: 'https://mhr.wikipedia.org',
  miwiki: 'https://mi.wikipedia.org',
  miwikipedia: 'https://mi.wikipedia.org',
  miwiktionary: 'https://mi.wiktionary.org',
  miwikibooks: 'https://mi.wikibooks.org',
  minwiki: 'https://min.wikipedia.org',
  minwikipedia: 'https://min.wikipedia.org',
  mkwiki: 'https://mk.wikipedia.org',
  mkwikipedia: 'https://mk.wikipedia.org',
  mkwiktionary: 'https://mk.wiktionary.org',
  mkwikibooks: 'https://mk.wikibooks.org',
  mkwikisource: 'https://mk.wikisource.org',
  mlwiki: 'https://ml.wikipedia.org',
  mlwikipedia: 'https://ml.wikipedia.org',
  mlwiktionary: 'https://ml.wiktionary.org',
  mlwikibooks: 'https://ml.wikibooks.org',
  mlwikiquote: 'https://ml.wikiquote.org',
  mlwikisource: 'https://ml.wikisource.org',
  mnwiki: 'https://mn.wikipedia.org',
  mnwikipedia: 'https://mn.wikipedia.org',
  mnwiktionary: 'https://mn.wiktionary.org',
  mnwikibooks: 'https://mn.wikibooks.org',
  mrwiki: 'https://mr.wikipedia.org',
  mrwikipedia: 'https://mr.wikipedia.org',
  mrwiktionary: 'https://mr.wiktionary.org',
  mrwikibooks: 'https://mr.wikibooks.org',
  mrwikiquote: 'https://mr.wikiquote.org',
  mrwikisource: 'https://mr.wikisource.org',
  mrjwiki: 'https://mrj.wikipedia.org',
  mrjwikipedia: 'https://mrj.wikipedia.org',
  mswiki: 'https://ms.wikipedia.org',
  mswikipedia: 'https://ms.wikipedia.org',
  mswiktionary: 'https://ms.wiktionary.org',
  mswikibooks: 'https://ms.wikibooks.org',
  mtwiki: 'https://mt.wikipedia.org',
  mtwikipedia: 'https://mt.wikipedia.org',
  mtwiktionary: 'https://mt.wiktionary.org',
  muswiki: 'https://mus.wikipedia.org',
  muswikipedia: 'https://mus.wikipedia.org',
  mwlwiki: 'https://mwl.wikipedia.org',
  mwlwikipedia: 'https://mwl.wikipedia.org',
  mywiki: 'https://my.wikipedia.org',
  mywikipedia: 'https://my.wikipedia.org',
  mywiktionary: 'https://my.wiktionary.org',
  mywikibooks: 'https://my.wikibooks.org',
  myvwiki: 'https://myv.wikipedia.org',
  myvwikipedia: 'https://myv.wikipedia.org',
  mznwiki: 'https://mzn.wikipedia.org',
  mznwikipedia: 'https://mzn.wikipedia.org',
  nawiki: 'https://na.wikipedia.org',
  nawikipedia: 'https://na.wikipedia.org',
  nawiktionary: 'https://na.wiktionary.org',
  nawikibooks: 'https://na.wikibooks.org',
  nawikiquote: 'https://na.wikiquote.org',
  nahwiki: 'https://nah.wikipedia.org',
  nahwikipedia: 'https://nah.wikipedia.org',
  nahwiktionary: 'https://nah.wiktionary.org',
  nahwikibooks: 'https://nah.wikibooks.org',
  napwiki: 'https://nap.wikipedia.org',
  napwikipedia: 'https://nap.wikipedia.org',
  ndswiki: 'https://nds.wikipedia.org',
  ndswikipedia: 'https://nds.wikipedia.org',
  ndswiktionary: 'https://nds.wiktionary.org',
  ndswikibooks: 'https://nds.wikibooks.org',
  ndswikiquote: 'https://nds.wikiquote.org',
  nds_nlwiki: 'https://nds-nl.wikipedia.org',
  nds_nlwikipedia: 'https://nds-nl.wikipedia.org',
  newiki: 'https://ne.wikipedia.org',
  newikipedia: 'https://ne.wikipedia.org',
  newiktionary: 'https://ne.wiktionary.org',
  newikibooks: 'https://ne.wikibooks.org',
  newwiki: 'https://new.wikipedia.org',
  newwikipedia: 'https://new.wikipedia.org',
  ngwiki: 'https://ng.wikipedia.org',
  ngwikipedia: 'https://ng.wikipedia.org',
  nlwiki: 'https://nl.wikipedia.org',
  nlwikipedia: 'https://nl.wikipedia.org',
  nlwiktionary: 'https://nl.wiktionary.org',
  nlwikibooks: 'https://nl.wikibooks.org',
  nlwikinews: 'https://nl.wikinews.org',
  nlwikiquote: 'https://nl.wikiquote.org',
  nlwikisource: 'https://nl.wikisource.org',
  nlwikivoyage: 'https://nl.wikivoyage.org',
  nnwiki: 'https://nn.wikipedia.org',
  nnwikipedia: 'https://nn.wikipedia.org',
  nnwiktionary: 'https://nn.wiktionary.org',
  nnwikiquote: 'https://nn.wikiquote.org',
  nowiki: 'https://no.wikipedia.org',
  nowikipedia: 'https://no.wikipedia.org',
  nowiktionary: 'https://no.wiktionary.org',
  nowikibooks: 'https://no.wikibooks.org',
  nowikinews: 'https://no.wikinews.org',
  nowikiquote: 'https://no.wikiquote.org',
  nowikisource: 'https://no.wikisource.org',
  novwiki: 'https://nov.wikipedia.org',
  novwikipedia: 'https://nov.wikipedia.org',
  nrmwiki: 'https://nrm.wikipedia.org',
  nrmwikipedia: 'https://nrm.wikipedia.org',
  nsowiki: 'https://nso.wikipedia.org',
  nsowikipedia: 'https://nso.wikipedia.org',
  nvwiki: 'https://nv.wikipedia.org',
  nvwikipedia: 'https://nv.wikipedia.org',
  nywiki: 'https://ny.wikipedia.org',
  nywikipedia: 'https://ny.wikipedia.org',
  ocwiki: 'https://oc.wikipedia.org',
  ocwikipedia: 'https://oc.wikipedia.org',
  ocwiktionary: 'https://oc.wiktionary.org',
  ocwikibooks: 'https://oc.wikibooks.org',
  olowiki: 'https://olo.wikipedia.org',
  olowikipedia: 'https://olo.wikipedia.org',
  omwiki: 'https://om.wikipedia.org',
  omwikipedia: 'https://om.wikipedia.org',
  omwiktionary: 'https://om.wiktionary.org',
  orwiki: 'https://or.wikipedia.org',
  orwikipedia: 'https://or.wikipedia.org',
  orwiktionary: 'https://or.wiktionary.org',
  orwikisource: 'https://or.wikisource.org',
  oswiki: 'https://os.wikipedia.org',
  oswikipedia: 'https://os.wikipedia.org',
  pawiki: 'https://pa.wikipedia.org',
  pawikipedia: 'https://pa.wikipedia.org',
  pawiktionary: 'https://pa.wiktionary.org',
  pawikibooks: 'https://pa.wikibooks.org',
  pawikisource: 'https://pa.wikisource.org',
  pagwiki: 'https://pag.wikipedia.org',
  pagwikipedia: 'https://pag.wikipedia.org',
  pamwiki: 'https://pam.wikipedia.org',
  pamwikipedia: 'https://pam.wikipedia.org',
  papwiki: 'https://pap.wikipedia.org',
  papwikipedia: 'https://pap.wikipedia.org',
  pcdwiki: 'https://pcd.wikipedia.org',
  pcdwikipedia: 'https://pcd.wikipedia.org',
  pdcwiki: 'https://pdc.wikipedia.org',
  pdcwikipedia: 'https://pdc.wikipedia.org',
  pflwiki: 'https://pfl.wikipedia.org',
  pflwikipedia: 'https://pfl.wikipedia.org',
  piwiki: 'https://pi.wikipedia.org',
  piwikipedia: 'https://pi.wikipedia.org',
  piwiktionary: 'https://pi.wiktionary.org',
  pihwiki: 'https://pih.wikipedia.org',
  pihwikipedia: 'https://pih.wikipedia.org',
  plwiki: 'https://pl.wikipedia.org',
  plwikipedia: 'https://pl.wikipedia.org',
  plwiktionary: 'https://pl.wiktionary.org',
  plwikibooks: 'https://pl.wikibooks.org',
  plwikinews: 'https://pl.wikinews.org',
  plwikiquote: 'https://pl.wikiquote.org',
  plwikisource: 'https://pl.wikisource.org',
  plwikivoyage: 'https://pl.wikivoyage.org',
  pmswiki: 'https://pms.wikipedia.org',
  pmswikipedia: 'https://pms.wikipedia.org',
  pmswikisource: 'https://pms.wikisource.org',
  pnbwiki: 'https://pnb.wikipedia.org',
  pnbwikipedia: 'https://pnb.wikipedia.org',
  pnbwiktionary: 'https://pnb.wiktionary.org',
  pntwiki: 'https://pnt.wikipedia.org',
  pntwikipedia: 'https://pnt.wikipedia.org',
  pswiki: 'https://ps.wikipedia.org',
  pswikipedia: 'https://ps.wikipedia.org',
  pswiktionary: 'https://ps.wiktionary.org',
  pswikibooks: 'https://ps.wikibooks.org',
  pswikivoyage: 'https://ps.wikivoyage.org',
  ptwiki: 'https://pt.wikipedia.org',
  ptwikipedia: 'https://pt.wikipedia.org',
  ptwiktionary: 'https://pt.wiktionary.org',
  ptwikibooks: 'https://pt.wikibooks.org',
  ptwikinews: 'https://pt.wikinews.org',
  ptwikiquote: 'https://pt.wikiquote.org',
  ptwikisource: 'https://pt.wikisource.org',
  ptwikiversity: 'https://pt.wikiversity.org',
  ptwikivoyage: 'https://pt.wikivoyage.org',
  quwiki: 'https://qu.wikipedia.org',
  quwikipedia: 'https://qu.wikipedia.org',
  quwiktionary: 'https://qu.wiktionary.org',
  quwikibooks: 'https://qu.wikibooks.org',
  quwikiquote: 'https://qu.wikiquote.org',
  rmwiki: 'https://rm.wikipedia.org',
  rmwikipedia: 'https://rm.wikipedia.org',
  rmwiktionary: 'https://rm.wiktionary.org',
  rmwikibooks: 'https://rm.wikibooks.org',
  rmywiki: 'https://rmy.wikipedia.org',
  rmywikipedia: 'https://rmy.wikipedia.org',
  rnwiki: 'https://rn.wikipedia.org',
  rnwikipedia: 'https://rn.wikipedia.org',
  rnwiktionary: 'https://rn.wiktionary.org',
  rowiki: 'https://ro.wikipedia.org',
  rowikipedia: 'https://ro.wikipedia.org',
  rowiktionary: 'https://ro.wiktionary.org',
  rowikibooks: 'https://ro.wikibooks.org',
  rowikinews: 'https://ro.wikinews.org',
  rowikiquote: 'https://ro.wikiquote.org',
  rowikisource: 'https://ro.wikisource.org',
  rowikivoyage: 'https://ro.wikivoyage.org',
  roa_rupwiki: 'https://roa-rup.wikipedia.org',
  roa_rupwikipedia: 'https://roa-rup.wikipedia.org',
  roa_rupwiktionary: 'https://roa-rup.wiktionary.org',
  roa_tarawiki: 'https://roa-tara.wikipedia.org',
  roa_tarawikipedia: 'https://roa-tara.wikipedia.org',
  ruwiki: 'https://ru.wikipedia.org',
  ruwikipedia: 'https://ru.wikipedia.org',
  ruwiktionary: 'https://ru.wiktionary.org',
  ruwikibooks: 'https://ru.wikibooks.org',
  ruwikinews: 'https://ru.wikinews.org',
  ruwikiquote: 'https://ru.wikiquote.org',
  ruwikisource: 'https://ru.wikisource.org',
  ruwikiversity: 'https://ru.wikiversity.org',
  ruwikivoyage: 'https://ru.wikivoyage.org',
  ruewiki: 'https://rue.wikipedia.org',
  ruewikipedia: 'https://rue.wikipedia.org',
  rwwiki: 'https://rw.wikipedia.org',
  rwwikipedia: 'https://rw.wikipedia.org',
  rwwiktionary: 'https://rw.wiktionary.org',
  sawiki: 'https://sa.wikipedia.org',
  sawikipedia: 'https://sa.wikipedia.org',
  sawiktionary: 'https://sa.wiktionary.org',
  sawikibooks: 'https://sa.wikibooks.org',
  sawikiquote: 'https://sa.wikiquote.org',
  sawikisource: 'https://sa.wikisource.org',
  sahwiki: 'https://sah.wikipedia.org',
  sahwikipedia: 'https://sah.wikipedia.org',
  sahwikiquote: 'https://sah.wikiquote.org',
  sahwikisource: 'https://sah.wikisource.org',
  satwiki: 'https://sat.wikipedia.org',
  satwikipedia: 'https://sat.wikipedia.org',
  scwiki: 'https://sc.wikipedia.org',
  scwikipedia: 'https://sc.wikipedia.org',
  scwiktionary: 'https://sc.wiktionary.org',
  scnwiki: 'https://scn.wikipedia.org',
  scnwikipedia: 'https://scn.wikipedia.org',
  scnwiktionary: 'https://scn.wiktionary.org',
  scowiki: 'https://sco.wikipedia.org',
  scowikipedia: 'https://sco.wikipedia.org',
  sdwiki: 'https://sd.wikipedia.org',
  sdwikipedia: 'https://sd.wikipedia.org',
  sdwiktionary: 'https://sd.wiktionary.org',
  sdwikinews: 'https://sd.wikinews.org',
  sewiki: 'https://se.wikipedia.org',
  sewikipedia: 'https://se.wikipedia.org',
  sewikibooks: 'https://se.wikibooks.org',
  sgwiki: 'https://sg.wikipedia.org',
  sgwikipedia: 'https://sg.wikipedia.org',
  sgwiktionary: 'https://sg.wiktionary.org',
  shwiki: 'https://sh.wikipedia.org',
  shwikipedia: 'https://sh.wikipedia.org',
  shwiktionary: 'https://sh.wiktionary.org',
  siwiki: 'https://si.wikipedia.org',
  siwikipedia: 'https://si.wikipedia.org',
  siwiktionary: 'https://si.wiktionary.org',
  siwikibooks: 'https://si.wikibooks.org',
  simplewiki: 'https://simple.wikipedia.org',
  simplewikipedia: 'https://simple.wikipedia.org',
  simplewiktionary: 'https://simple.wiktionary.org',
  simplewikibooks: 'https://simple.wikibooks.org',
  simplewikiquote: 'https://simple.wikiquote.org',
  skwiki: 'https://sk.wikipedia.org',
  skwikipedia: 'https://sk.wikipedia.org',
  skwiktionary: 'https://sk.wiktionary.org',
  skwikibooks: 'https://sk.wikibooks.org',
  skwikiquote: 'https://sk.wikiquote.org',
  skwikisource: 'https://sk.wikisource.org',
  slwiki: 'https://sl.wikipedia.org',
  slwikipedia: 'https://sl.wikipedia.org',
  slwiktionary: 'https://sl.wiktionary.org',
  slwikibooks: 'https://sl.wikibooks.org',
  slwikiquote: 'https://sl.wikiquote.org',
  slwikisource: 'https://sl.wikisource.org',
  slwikiversity: 'https://sl.wikiversity.org',
  smwiki: 'https://sm.wikipedia.org',
  smwikipedia: 'https://sm.wikipedia.org',
  smwiktionary: 'https://sm.wiktionary.org',
  snwiki: 'https://sn.wikipedia.org',
  snwikipedia: 'https://sn.wikipedia.org',
  snwiktionary: 'https://sn.wiktionary.org',
  sowiki: 'https://so.wikipedia.org',
  sowikipedia: 'https://so.wikipedia.org',
  sowiktionary: 'https://so.wiktionary.org',
  sqwiki: 'https://sq.wikipedia.org',
  sqwikipedia: 'https://sq.wikipedia.org',
  sqwiktionary: 'https://sq.wiktionary.org',
  sqwikibooks: 'https://sq.wikibooks.org',
  sqwikinews: 'https://sq.wikinews.org',
  sqwikiquote: 'https://sq.wikiquote.org',
  srwiki: 'https://sr.wikipedia.org',
  srwikipedia: 'https://sr.wikipedia.org',
  srwiktionary: 'https://sr.wiktionary.org',
  srwikibooks: 'https://sr.wikibooks.org',
  srwikinews: 'https://sr.wikinews.org',
  srwikiquote: 'https://sr.wikiquote.org',
  srwikisource: 'https://sr.wikisource.org',
  srnwiki: 'https://srn.wikipedia.org',
  srnwikipedia: 'https://srn.wikipedia.org',
  sswiki: 'https://ss.wikipedia.org',
  sswikipedia: 'https://ss.wikipedia.org',
  sswiktionary: 'https://ss.wiktionary.org',
  stwiki: 'https://st.wikipedia.org',
  stwikipedia: 'https://st.wikipedia.org',
  stwiktionary: 'https://st.wiktionary.org',
  stqwiki: 'https://stq.wikipedia.org',
  stqwikipedia: 'https://stq.wikipedia.org',
  suwiki: 'https://su.wikipedia.org',
  suwikipedia: 'https://su.wikipedia.org',
  suwiktionary: 'https://su.wiktionary.org',
  suwikibooks: 'https://su.wikibooks.org',
  suwikiquote: 'https://su.wikiquote.org',
  svwiki: 'https://sv.wikipedia.org',
  svwikipedia: 'https://sv.wikipedia.org',
  svwiktionary: 'https://sv.wiktionary.org',
  svwikibooks: 'https://sv.wikibooks.org',
  svwikinews: 'https://sv.wikinews.org',
  svwikiquote: 'https://sv.wikiquote.org',
  svwikisource: 'https://sv.wikisource.org',
  svwikiversity: 'https://sv.wikiversity.org',
  svwikivoyage: 'https://sv.wikivoyage.org',
  swwiki: 'https://sw.wikipedia.org',
  swwikipedia: 'https://sw.wikipedia.org',
  swwiktionary: 'https://sw.wiktionary.org',
  swwikibooks: 'https://sw.wikibooks.org',
  szlwiki: 'https://szl.wikipedia.org',
  szlwikipedia: 'https://szl.wikipedia.org',
  tawiki: 'https://ta.wikipedia.org',
  tawikipedia: 'https://ta.wikipedia.org',
  tawiktionary: 'https://ta.wiktionary.org',
  tawikibooks: 'https://ta.wikibooks.org',
  tawikinews: 'https://ta.wikinews.org',
  tawikiquote: 'https://ta.wikiquote.org',
  tawikisource: 'https://ta.wikisource.org',
  tcywiki: 'https://tcy.wikipedia.org',
  tcywikipedia: 'https://tcy.wikipedia.org',
  tewiki: 'https://te.wikipedia.org',
  tewikipedia: 'https://te.wikipedia.org',
  tewiktionary: 'https://te.wiktionary.org',
  tewikibooks: 'https://te.wikibooks.org',
  tewikiquote: 'https://te.wikiquote.org',
  tewikisource: 'https://te.wikisource.org',
  tetwiki: 'https://tet.wikipedia.org',
  tetwikipedia: 'https://tet.wikipedia.org',
  tgwiki: 'https://tg.wikipedia.org',
  tgwikipedia: 'https://tg.wikipedia.org',
  tgwiktionary: 'https://tg.wiktionary.org',
  tgwikibooks: 'https://tg.wikibooks.org',
  thwiki: 'https://th.wikipedia.org',
  thwikipedia: 'https://th.wikipedia.org',
  thwiktionary: 'https://th.wiktionary.org',
  thwikibooks: 'https://th.wikibooks.org',
  thwikinews: 'https://th.wikinews.org',
  thwikiquote: 'https://th.wikiquote.org',
  thwikisource: 'https://th.wikisource.org',
  tiwiki: 'https://ti.wikipedia.org',
  tiwikipedia: 'https://ti.wikipedia.org',
  tiwiktionary: 'https://ti.wiktionary.org',
  tkwiki: 'https://tk.wikipedia.org',
  tkwikipedia: 'https://tk.wikipedia.org',
  tkwiktionary: 'https://tk.wiktionary.org',
  tkwikibooks: 'https://tk.wikibooks.org',
  tkwikiquote: 'https://tk.wikiquote.org',
  tlwiki: 'https://tl.wikipedia.org',
  tlwikipedia: 'https://tl.wikipedia.org',
  tlwiktionary: 'https://tl.wiktionary.org',
  tlwikibooks: 'https://tl.wikibooks.org',
  tnwiki: 'https://tn.wikipedia.org',
  tnwikipedia: 'https://tn.wikipedia.org',
  tnwiktionary: 'https://tn.wiktionary.org',
  towiki: 'https://to.wikipedia.org',
  towikipedia: 'https://to.wikipedia.org',
  towiktionary: 'https://to.wiktionary.org',
  tpiwiki: 'https://tpi.wikipedia.org',
  tpiwikipedia: 'https://tpi.wikipedia.org',
  tpiwiktionary: 'https://tpi.wiktionary.org',
  trwiki: 'https://tr.wikipedia.org',
  trwikipedia: 'https://tr.wikipedia.org',
  trwiktionary: 'https://tr.wiktionary.org',
  trwikibooks: 'https://tr.wikibooks.org',
  trwikinews: 'https://tr.wikinews.org',
  trwikiquote: 'https://tr.wikiquote.org',
  trwikisource: 'https://tr.wikisource.org',
  tswiki: 'https://ts.wikipedia.org',
  tswikipedia: 'https://ts.wikipedia.org',
  tswiktionary: 'https://ts.wiktionary.org',
  ttwiki: 'https://tt.wikipedia.org',
  ttwikipedia: 'https://tt.wikipedia.org',
  ttwiktionary: 'https://tt.wiktionary.org',
  ttwikibooks: 'https://tt.wikibooks.org',
  ttwikiquote: 'https://tt.wikiquote.org',
  tumwiki: 'https://tum.wikipedia.org',
  tumwikipedia: 'https://tum.wikipedia.org',
  twwiki: 'https://tw.wikipedia.org',
  twwikipedia: 'https://tw.wikipedia.org',
  twwiktionary: 'https://tw.wiktionary.org',
  tywiki: 'https://ty.wikipedia.org',
  tywikipedia: 'https://ty.wikipedia.org',
  tyvwiki: 'https://tyv.wikipedia.org',
  tyvwikipedia: 'https://tyv.wikipedia.org',
  udmwiki: 'https://udm.wikipedia.org',
  udmwikipedia: 'https://udm.wikipedia.org',
  ugwiki: 'https://ug.wikipedia.org',
  ugwikipedia: 'https://ug.wikipedia.org',
  ugwiktionary: 'https://ug.wiktionary.org',
  ugwikibooks: 'https://ug.wikibooks.org',
  ugwikiquote: 'https://ug.wikiquote.org',
  ukwiki: 'https://uk.wikipedia.org',
  ukwikipedia: 'https://uk.wikipedia.org',
  ukwiktionary: 'https://uk.wiktionary.org',
  ukwikibooks: 'https://uk.wikibooks.org',
  ukwikinews: 'https://uk.wikinews.org',
  ukwikiquote: 'https://uk.wikiquote.org',
  ukwikisource: 'https://uk.wikisource.org',
  ukwikivoyage: 'https://uk.wikivoyage.org',
  urwiki: 'https://ur.wikipedia.org',
  urwikipedia: 'https://ur.wikipedia.org',
  urwiktionary: 'https://ur.wiktionary.org',
  urwikibooks: 'https://ur.wikibooks.org',
  urwikiquote: 'https://ur.wikiquote.org',
  uzwiki: 'https://uz.wikipedia.org',
  uzwikipedia: 'https://uz.wikipedia.org',
  uzwiktionary: 'https://uz.wiktionary.org',
  uzwikibooks: 'https://uz.wikibooks.org',
  uzwikiquote: 'https://uz.wikiquote.org',
  vewiki: 'https://ve.wikipedia.org',
  vewikipedia: 'https://ve.wikipedia.org',
  vecwiki: 'https://vec.wikipedia.org',
  vecwikipedia: 'https://vec.wikipedia.org',
  vecwiktionary: 'https://vec.wiktionary.org',
  vecwikisource: 'https://vec.wikisource.org',
  vepwiki: 'https://vep.wikipedia.org',
  vepwikipedia: 'https://vep.wikipedia.org',
  viwiki: 'https://vi.wikipedia.org',
  viwikipedia: 'https://vi.wikipedia.org',
  viwiktionary: 'https://vi.wiktionary.org',
  viwikibooks: 'https://vi.wikibooks.org',
  viwikiquote: 'https://vi.wikiquote.org',
  viwikisource: 'https://vi.wikisource.org',
  viwikivoyage: 'https://vi.wikivoyage.org',
  vlswiki: 'https://vls.wikipedia.org',
  vlswikipedia: 'https://vls.wikipedia.org',
  vowiki: 'https://vo.wikipedia.org',
  vowikipedia: 'https://vo.wikipedia.org',
  vowiktionary: 'https://vo.wiktionary.org',
  vowikibooks: 'https://vo.wikibooks.org',
  vowikiquote: 'https://vo.wikiquote.org',
  wawiki: 'https://wa.wikipedia.org',
  wawikipedia: 'https://wa.wikipedia.org',
  wawiktionary: 'https://wa.wiktionary.org',
  wawikibooks: 'https://wa.wikibooks.org',
  warwiki: 'https://war.wikipedia.org',
  warwikipedia: 'https://war.wikipedia.org',
  wowiki: 'https://wo.wikipedia.org',
  wowikipedia: 'https://wo.wikipedia.org',
  wowiktionary: 'https://wo.wiktionary.org',
  wowikiquote: 'https://wo.wikiquote.org',
  wuuwiki: 'https://wuu.wikipedia.org',
  wuuwikipedia: 'https://wuu.wikipedia.org',
  xalwiki: 'https://xal.wikipedia.org',
  xalwikipedia: 'https://xal.wikipedia.org',
  xhwiki: 'https://xh.wikipedia.org',
  xhwikipedia: 'https://xh.wikipedia.org',
  xhwiktionary: 'https://xh.wiktionary.org',
  xhwikibooks: 'https://xh.wikibooks.org',
  xmfwiki: 'https://xmf.wikipedia.org',
  xmfwikipedia: 'https://xmf.wikipedia.org',
  yiwiki: 'https://yi.wikipedia.org',
  yiwikipedia: 'https://yi.wikipedia.org',
  yiwiktionary: 'https://yi.wiktionary.org',
  yiwikisource: 'https://yi.wikisource.org',
  yowiki: 'https://yo.wikipedia.org',
  yowikipedia: 'https://yo.wikipedia.org',
  yowiktionary: 'https://yo.wiktionary.org',
  yowikibooks: 'https://yo.wikibooks.org',
  zawiki: 'https://za.wikipedia.org',
  zawikipedia: 'https://za.wikipedia.org',
  zawiktionary: 'https://za.wiktionary.org',
  zawikibooks: 'https://za.wikibooks.org',
  zawikiquote: 'https://za.wikiquote.org',
  zeawiki: 'https://zea.wikipedia.org',
  zeawikipedia: 'https://zea.wikipedia.org',
  zhwiki: 'https://zh.wikipedia.org',
  zhwikipedia: 'https://zh.wikipedia.org',
  zhwiktionary: 'https://zh.wiktionary.org',
  zhwikibooks: 'https://zh.wikibooks.org',
  zhwikinews: 'https://zh.wikinews.org',
  zhwikiquote: 'https://zh.wikiquote.org',
  zhwikisource: 'https://zh.wikisource.org',
  zhwikiversity: 'https://zh.wikiversity.org',
  zhwikivoyage: 'https://zh.wikivoyage.org',
  zh_classicalwiki: 'https://zh-classical.wikipedia.org',
  zh_classicalwikipedia: 'https://zh-classical.wikipedia.org',
  zh_min_nanwiki: 'https://zh-min-nan.wikipedia.org',
  zh_min_nanwikipedia: 'https://zh-min-nan.wikipedia.org',
  zh_min_nanwiktionary: 'https://zh-min-nan.wiktionary.org',
  zh_min_nanwikibooks: 'https://zh-min-nan.wikibooks.org',
  zh_min_nanwikiquote: 'https://zh-min-nan.wikiquote.org',
  zh_min_nanwikisource: 'https://zh-min-nan.wikisource.org',
  zh_yuewiki: 'https://zh-yue.wikipedia.org',
  zh_yuewikipedia: 'https://zh-yue.wikipedia.org',
  zuwiki: 'https://zu.wikipedia.org',
  zuwikipedia: 'https://zu.wikipedia.org',
  zuwiktionary: 'https://zu.wiktionary.org',
  zuwikibooks: 'https://zu.wikibooks.org'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = site_map;
}

},{}],3:[function(_dereq_,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//allow quite! flexible params to fetch, category
// [lang], [options], [callback]
var getParams = function getParams(a, b, c, d) {
  var options = {};
  var lang = 'en';
  var domain = 'wikipedia';
  var callback = null;

  if (typeof a === 'function') {
    callback = a;
  } else if (_typeof(a) === 'object') {
    options = a;
  } else if (typeof a === 'string') {
    lang = a;
  }

  if (typeof b === 'function') {
    callback = b;
  } else if (_typeof(b) === 'object') {
    options = b;
  } else if (typeof b === 'string') {
    domain = b;
  }

  if (typeof c === 'function') {
    callback = c;
  } else if (_typeof(c) === 'object') {
    options = c;
  }

  if (typeof d === 'function') {
    callback = d;
  }

  var params = {
    "options": options,
    "lang": lang,
    "domain": domain,
    "callback": callback
  }; // console.log("Call: getParams() params="+JSON.stringify(params,null,2));

  return params;
};

module.exports = getParams;

},{}],4:[function(_dereq_,module,exports){
"use strict";

var fetch = _dereq_('cross-fetch');

var request = function request(url, options) {
  var params = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Api-User-Agent': options.userAgent || options['User-Agent'] || options['Api-User-Agent'] || 'Random user of the wtf_wikipedia library'
    }
  };
  return fetch(url, params).then(function (response) {
    if (response.status !== 200) {
      throw response;
    }

    return response.json();
  }).catch(console.error);
};

module.exports = request;

},{"cross-fetch":1}],5:[function(_dereq_,module,exports){
"use strict";

var site_map = _dereq_('../_data/site_map');

var isUrl = /^https?:\/\//;

function isArray(arr) {
  return arr.constructor.toString().indexOf('Array') > -1;
}

var getUrl_prefix = function getUrl_prefix(lang, domain) {
  domain = domain || "wikipedia";
  lang = lang || 'en';
  var url = "https://".concat(lang, ".").concat(domain, ".org/w/api.php");

  if (site_map[lang]) {
    url = site_map[lang] + '/w/api.php';
  }

  return url;
};

var makeTitle = function makeTitle() {
  var title = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  //if given a url...
  if (isUrl.test(title) === true) {
    title = title.replace(/.*?\/wiki\//, '');
    title = title.replace(/\?.*/, '');
  }

  title = encodeURIComponent(title);
  return title;
};

var makeUrl_title = function makeUrl_title(title, lang, domain, options) {
  domain = domain || "wikipedia";
  lang = lang || 'en';
  options = options || {};
  var url = getUrl_prefix(lang, domain); // set an alternative wiki URL;

  if (options.wikiUrl) {
    url = options.wikiUrl;
  } //we use the 'revisions' api here, instead of the Raw api, for its CORS-rules..


  url += '?action=query&prop=revisions&rvprop=content&maxlag=5&rvslots=main&format=json';

  if (!options.wikiUrl) {
    url += '&origin=*';
  }

  if (options.follow_redirects !== false) {
    url += '&redirects=true';
  }

  var lookup = 'titles';
  var pages = []; //support one, or many pages

  if (isArray(title) === false) {
    pages = [title];
  } else {
    pages = title;
  } //assume numbers mean pageid, and strings are titles (like '1984')


  if (typeof pages[0] === 'number') {
    lookup = 'pageids';
  } else {
    pages = pages.map(makeTitle);
  }

  pages = pages.filter(function (p) {
    return p !== '';
  });
  pages = pages.join('|');
  url += '&' + lookup + '=' + pages;
  return url;
};

var makeUrl_random = function makeUrl_random(lang, domain) {
  // set default values for parameters
  domain = domain || "wikipedia";
  lang = lang || "en";
  var url = getUrl_prefix(lang, domain);
  url += "?format=json&action=query&generator=random&grnnamespace=0&prop=revisions&rvprop=content&grnlimit=1&rvslots=main&origin=*";
  return url;
};

var makeUrl_category = function makeUrl_category(cat, lang, domain) {
  cat = encodeURIComponent(cat);
  var url = getUrl_prefix(lang, domain);
  url += "?action=query&list=categorymembers&cmtitle=".concat(cat, "&cmlimit=500&format=json&origin=*&redirects=true&cmtype=page|subcat");
  return url;
};

var makeUrl = {
  title: makeUrl_title,
  random: makeUrl_random,
  category: makeUrl_category
};
module.exports = makeUrl;

},{"../_data/site_map":2}],6:[function(_dereq_,module,exports){
"use strict";

var request = _dereq_('./_request');

var getParams = _dereq_('./_params');

var makeUrl = _dereq_('./_url').category;

var normalizeCategory = function normalizeCategory() {
  var cat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (/^Category/i.test(cat) === false) {
    cat = 'Category:' + cat;
  }

  cat = cat.replace(/ /g, '_');
  return cat;
};

var addResult = function addResult(body, out) {
  if (body.query && body.query.categorymembers) {
    var list = body.query.categorymembers;
    list.forEach(function (p) {
      if (p.ns === 14) {
        out.categories.push(p);
      } else {
        out.pages.push(p);
      }
    });
    return out;
  }

  return out;
};

var getCategories = function getCategories(cat, a, b, c, d) {
  var _getParams = getParams(a, b, c, d),
      lang = _getParams.lang,
      domain = _getParams.domain,
      options = _getParams.options,
      callback = _getParams.callback; //cleanup cat name


  cat = normalizeCategory(cat);
  var url = makeUrl(cat, lang, domain, options);
  var safety = 0;
  var output = {
    category: cat,
    pages: [],
    categories: []
  };

  var doit = function doit() {
    var cntd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var cb = arguments.length > 1 ? arguments[1] : undefined;
    var myUrl = url + '&cmcontinue=' + cntd;
    var p = request(myUrl, options);
    p.then(function (body) {
      output = addResult(body, output); //should we do another?

      if (body.continue && body.continue.cmcontinue && body.continue.cmcontinue !== cntd && safety < 25) {
        safety += 1;
        doit(body.continue.cmcontinue, cb);
      } else {
        cb(null, output);
      }
    });
  };

  return new Promise(function (resolve, reject) {
    doit('', function (err) {
      if (typeof callback === 'function') {
        callback(err, output);
      }

      if (err) {
        reject(err);
      }

      resolve(output);
    });
  });
};

module.exports = getCategories;

},{"./_params":3,"./_request":4,"./_url":5}],7:[function(_dereq_,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//grab the content of any article, off the api
var request = _dereq_('./_request'); //const makeUrl = require('./_url');


var makeUrl = _dereq_('./_url').title;

var getParams = _dereq_('./_params'); //num pages per request


var MAX_PAGES = 5; // this data-format from mediawiki api is nutso
// domain="wikipedia" ("wikiversity", ...)
// lang="en"  ("de", "fr" ...)

var postProcess = function postProcess(data, lang, domain) {
  var pages = Object.keys(data.query.pages);
  var docs = pages.map(function (id) {
    var page = data.query.pages[id] || {};

    if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
      return null;
    }

    var text = page.revisions[0]['*']; //us the 'generator' result format, for the random() method

    if (!text && page.revisions[0].slots) {
      text = page.revisions[0].slots.main['*'];
    }

    var wikipage = {
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
      throw e;
    }
  });
  return docs;
}; //recursive fn to fetch groups of pages, serially


var doPages = function doPages(pages, results, lang, domain, options, cb) {
  var todo = pages.slice(0, MAX_PAGES);
  var url = makeUrl(todo, lang, domain, options);
  var p = request(url, options);
  p.then(function (wiki) {
    var res = postProcess(wiki, lang, domain);
    results = results.concat(res);
    var remain = pages.slice(MAX_PAGES);

    if (remain.length > 0) {
      return doPages(remain, results, lang, domain, options, cb); //recursive
    }

    return cb(results);
  }).catch(function (e) {
    console.error('wtf_fetch error: ' + e);
    cb(results);
  });
}; //grab a single, or list of pages (or ids)


var fetchPage = function fetchPage() {
  var pages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var p1 = arguments.length > 1 ? arguments[1] : undefined;
  var p2 = arguments.length > 2 ? arguments[2] : undefined;
  var p3 = arguments.length > 3 ? arguments[3] : undefined;
  var p4 = arguments.length > 4 ? arguments[4] : undefined;

  if (_typeof(pages) !== 'object') {
    pages = [pages];
  }

  if (typeof cb !== 'function') {
    console.log("CALL: fetchPage() - no callback defined!");
  } else {
    console.log("Callback is defined in fetchPage()-call!");
  }

  ;

  var _getParams = getParams(p1, p2, p3, p4),
      lang = _getParams.lang,
      domain = _getParams.domain,
      options = _getParams.options,
      callback = _getParams.callback;

  return new Promise(function (resolve, reject) {
    // courtesy-check for spamming wp servers
    if (pages.length > 500) {
      console.error('wtf_fetch error: Requested ' + pages.length + ' pages.');
      reject('Requested too many pages, exiting.');
      return;
    }

    doPages(pages, [], lang, domain, options, function (docs) {
      docs = docs.filter(function (d) {
        return d !== null;
      }); //return the first doc, if we only asked for one

      if (pages.length === 1) {
        docs = docs[0];
      }

      docs = docs || null; //support 'err-back' format

      if (callback && typeof callback === 'function') {
        //console.log("Callback defined in Promise!\n"+callback+"\n docs="+JSON.stringify(docs,null,2));
        callback(null, docs);
      } else {// console.log("No callback defined in Promise!");
      }

      resolve(docs);
    });
  });
};

module.exports = fetchPage;

},{"./_params":3,"./_request":4,"./_url":5}],8:[function(_dereq_,module,exports){
"use strict";

var request = _dereq_('./_request');

var getParams = _dereq_('./_params');

var makeUrl = _dereq_('./_url').random; //this data-format from mediawiki api is nutso


var postProcess = function postProcess(data, lang, domain) {
  var pages = Object.keys(data.query.pages);
  var id = pages[0];
  var page = data.query.pages[id] || {};

  if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
    return null;
  } //us the 'generator' result format, for the random() method


  var text = page.revisions[0].slots.main['*'];
  var wikipage = {
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
    throw e;
  }
}; //fetch and parse a random page from the api


var getRandom = function getRandom(a, b, c, d) {
  var _getParams = getParams(a, b, c, d),
      lang = _getParams.lang,
      domain = _getParams.domain,
      options = _getParams.options,
      callback = _getParams.callback;

  var url = makeUrl(lang);
  return new Promise(function (resolve, reject) {
    var p = request(url, options);
    p.then(function (res) {
      return postProcess(res, lang, domain);
    }).then(function (doc) {
      //support 'err-back' format
      if (typeof callback === 'function') {
        callback(null, doc);
      }

      resolve(doc);
    }).catch(reject);
  });
};

module.exports = getRandom;

},{"./_params":3,"./_request":4,"./_url":5}],9:[function(_dereq_,module,exports){
"use strict";

module.exports = '1.7.0';

},{}],10:[function(_dereq_,module,exports){
"use strict";

var fetch = _dereq_('./_fetch/fetch');

var random = _dereq_('./_fetch/random');

var category = _dereq_('./_fetch/category');

var version = _dereq_('./_version'); //const parseDocument = require('./01-document/index.js');
//the main 'factory' exported method


var wtf = function wtf(wiki, options) {
  //return parseDocument(wiki, options);
  return {
    "wiki": wiki,
    "options": options
  };
};

wtf.fetch = function (title, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return fetch(title, lang, domain, options, cb);
};

wtf.random = function (lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return random(lang, domain, options, cb);
};

wtf.category = function (cat, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return category(cat, lang, domain, options, cb);
};

wtf.getPage = function (title, lang, domain, options, cb) {
  domain = domain || "wikipedia";
  return fetch(title, lang, domain, options, cb);
};

wtf.version = version;
module.exports = wtf;

},{"./_fetch/category":6,"./_fetch/fetch":7,"./_fetch/random":8,"./_version":9}]},{},[10])(10)
});
