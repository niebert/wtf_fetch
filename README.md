
## wtf_fetch - submodule of `wtf_wikipedia`
`wtf_fetch` is submodule of wikipedia markup parser `wtf_wikipedia` developed by <a href="https://spencermountain.github.io/">Spencer Kelly</a> and <a href="https://github.com/spencermountain/wtf_wikipedia/graphs/contributors"> contributors </a>

`wtf_wikipedia` turns wikipedia's markup language into `JSON`, so extracting the content of a MediaWiki source as JSON data by parsing the wiki markup.

If you consider the source of `wtf_wikipedia` you can identify 3 major step:
* `wtf_fetch` retrieving the wiki markup source from the MediaWiki API,  i.e. https://www.wikipedia.org, https://www.wikiversity.org, https://www.wikivoyage.org, ...
* `wtf_parse`, that parses wiki source into a `Document` object (Abstract Syntax Tree)  
* `wtf_output`, that generates/renders the output for a specific format from a given `Document` object.

`wtf_wikipedia` integrates all these 3 tasks in one module. The provide module decomposes one of those tasks in this submodules. The submodules `wtf_fetch`, `wtf_parse` and `wtf_output` may be required independently in different project repository by a `require` command. Furthermore it improves maintenance, reusability of submodules and it separates the `tasks` in `wtf_wikipedia` in the submodules `wtf_fetch`, `wtf_parse`, `wtf_output`. If the modules are there `wtf_wikipedia`  can be used just for `chaining` the tasks and other submodule can be added to the process chain in `wtf_wikipedia`. E.g. citation management would be a submodule called `wtf_citation` that could be implemented to insert a the citations in a document and fulfills a certain tasks. This modules uses the modular structure of `wtf_wikipedia` in the folder `src/` to extract the current task in a separate repository. Later the current local `require` commands in `wtf_wikipedia` can be replaced by a remote `require` from `npm`.

This could be documented in the `README.md` as developer recommendation and helps developers to understand the way forward and how they could add new `wtf_modules` in the chaining process. In this sense `wtf_wikipedia` will become the chain managment module of `wtf_submodules`.

## Installation

<kbd>npm install wtf_fetch</kbd>

```javascript
var wtf_fetch = require('wtf_fetch');

wtf_fetch.getPage('Swarm Intelligence', 'en','wikipedia' function(err, doc) {
  // doc contains the download
  console.log(doc);
});
```
***on the client-side:***
```html
<script src="https://unpkg.com/wtf_fetch@latest/builds/wtf_fetch.min.js"></script>
<script>
  //(follows redirect)
  wtf_fetch.getPage('Water', 'en','wikiversity' function(err, doc) {
    // doc contains the download
    console.log(doc);
  });
</script>
```

# What it does:
* Downloads Wiki markup source for an article from a MediaWiki of the Wiki Foundation
* Allows different MediaWiki source, e.g. Wikipedia, Wikiversity, Wikivoyage, ...

## But what about...


### wiky.js - wiki2html.js
[wiky.js](https://github.com/tanin47/wiky.js) [wiki2html](https://github.com/brechtbilliet/wiki2html) are simple libraries that convert sources from a MediaWiki to HTML. With these converters you can start with, to learn about parsing a wiki source document downloaded from a MediaWiki.

### Parsoid:
Wikimedia's [Parsoid javascript parser](https://www.mediawiki.org/wiki/Parsoid) is the official wikiscript parser. It
reliably turns wikiscript into HTML, but not valid XML.

To use it for data-mining, you'll need to:
```
parsoid(wikiText) -> [headless/pretend-DOM] -> screen-scraping
```
which is fine,

but getting structured data this way (say, ***sentences*** or ***infobox values***), is still a complex + weird process. Arguably, you're not  any closer than you were with wikitext.
This library has ***lovingly ❤️*** borrowed a lot of code and data from the parsoid project, and thanks its contributors.

### Full data-dumps:
wtf_wikipedia was built to work with [dumpster-dive](https://github.com/spencermountain/dumpster-dive),
which lets you parse a whole wikipedia dump on a laptop in a couple hours. It's definitely the way to go, instead of fetching many pages off the api.

# API
* **wtf_fetch.getPage(title, [lang], [domain], [options], [callback])**

### outputs:
A hash with the content
```json
{
  "wiki": "This is the source as wiki markdown",
  "options":{
    "pageid"
  }
}
```

## Examples

### **wtf(wikiText)**
flip your wikimedia markup into a `Document` object

```javascript
import wtf from 'wtf_wikipedia'
wtf("==In Popular Culture==\n*harry potter's wand\n* the simpsons fence");
// Document {plaintext(), html(), latex()...}
```

### **wtf.fetch(title, [lang_or_wikiid], [options], [callback])**
retrieves raw contents of a mediawiki article from the wikipedia action API.

This method supports the **errback** callback form, or returns a [Promise](https://spring.io/understanding/javascript-promises) if one is missing.

to call non-english wikipedia apis, add [it's language-name](http://en.wikipedia.org/w/api.php?action=sitematrix&format=json) as the second parameter

```javascript
wtf.fetch('Toronto', 'de', function(err, doc) {
  doc.plaintext();
  //Toronto ist mit 2,6 Millionen Einwohnern..
});
```
you may also pass the wikipedia page id as parameter instead of the page title:

```javascript
wtf.fetch(64646, 'de').then(console.log).catch(console.log)
```
the fetch method follows redirects.

### **doc.plaintext()**
returns only nice text of the article
```js
var wiki =
  "[[Greater_Boston|Boston]]'s [[Fenway_Park|baseball field]] has a {{convert|37|ft}} wall.<ref>{{cite web|blah}}</ref>";
var text = wtf(wiki).plaintext();
//"Boston's baseball field has a 37ft wall."
```
<!--
## **.custom({})**

if you're trying to parse a weird template, or an obscure wiki syntax somewhere, this library supports a customization
step, where you can pass-in random parsers to run, before your result is generated.

```js
var str = `{{myTempl|cool data!}} Whistling is a sport in some countries...`;
wtf.custom({
  mine: str => {
    let m = str.match(/^\{\{myTempl\|(.+?)\}\}$/);
    if (m) {
      return m[1];
    }
  }
});
wtf.parse(str);
//{title:'Whistling', custom: {mine:['cool data!']} }
```

this way, you can extend the library with your own regexes, and all that. -->

## **CLI**
if you're scripting this from the shell, or from another language, install with a `-g`, and then run:

```shell
$ wtf_wikipedia George Clooney --plaintext
# George Timothy Clooney (born May 6, 1961) is an American actor ...

$ wtf_wikipedia Toronto Blue Jays --json
# {text:[...], infobox:{}, categories:[...], images:[] }
```

### Good practice:
The wikipedia api is [pretty welcoming](https://www.mediawiki.org/wiki/API:Etiquette#Request_limit) though recommends three things, if you're going to hit it heavily -
* 1️⃣ pass a `Api-User-Agent` as something so they can use to easily throttle bad scripts
* 2️⃣ bundle multiple pages into one request as an array
* 3️⃣ run it serially, or at least, [slowly](https://www.npmjs.com/package/slow).
```js
wtf.fetch(['Royal Cinema', 'Aldous Huxley'], 'en', {
  'Api-User-Agent': 'spencermountain@gmail.com'
}).then((docList) => {
  let allLinks = docList.map(doc => doc.links());
  console.log(allLinks);
});
```

# Contributing
projects like these are only done with many-hands, and I try to be a friendly and easy maintainer. (promise!)

[Join in!](./contributing.md)

Thank you to the [cross-fetch](https://github.com/lquixada/cross-fetch) and [jshashes](https://github.com/h2non/jshashes) libraries.

See also:
* [instaview](https://en.wikipedia.org/wiki/User:Pilaf/InstaView)
* [txtwiki](https://github.com/joaomsa/txtwiki.js)
* [Parsoid](https://www.mediawiki.org/wiki/Parsoid)

MIT
