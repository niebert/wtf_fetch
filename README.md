
## wtf_fetch - submodule of `wtf_wikipedia`
`wtf_fetch` is submodule of wikipedia markup parser `wtf_wikipedia` developed by <a href="https://spencermountain.github.io/">Spencer Kelly</a> and <a href="https://github.com/spencermountain/wtf_wikipedia/graphs/contributors"> contributors </a>

[`wtf_wikipedia`](https://github.com/spencermountain/wtf_wikipedia) turns wikipedia's markup language into `JSON`, so the library performs in addition to fetching also the extraction of content of a MediaWiki source and provides by parsing of the source a structured JSON data representing the wiki markup source.

## Demo HTML5-Application of `wtf_fetch`
The following [wtf_fetch-demo](https://niebert.github.io/wtf_fetch) is HTML-page, that imports the library `wtf_fetch.js` and
* uses HTML-form elements to determine the Wikipedia article and the domain from which the article should be download.
* Provides a `Display Source` button to show the current source file in the MediaWiki of Wikiversity or Wikipedia.
* The download (`wtf_fetch`) appends a source info at the very end of the downloaded Wiki source, to create a reference in the text to the source. This workflow is similar to a citation in scientific article - see function `append_source_info()`)
:: <font size="+2">[Demo wtf_fetch](https://niebert.github.io/wtf_fetch)</font>
* [Wikipedia2Wikiversity](https://niebert.github.io/Wikipedia2Wikiversity) uses `wtf_fetch` to download the Wikipedia markdown source into a textarea of an HTML file. The Wiki markdown source is processed and so that interwiki links from Wikiversity to Wikipedia work. [Wikipedia2Wikiversity](https://niebert.github.io/Wikipedia2Wikiversity) is also a demonstrator of an [AppLSAC-0](https://en.wikiversity.org/wiki/AppLSAC).

## See also
The following repositories are related to `wtf_fetch`:  
* [`wtf_wikipedia`](https://github.com/spencermountain/wtf_wikipedia/) is the source repository developed by Spencer Kelly, who created that great library for Wikipedia article processing.
* [Wiki2Reveal](https://niebert.github.io/Wiki2Reveal) that uses `wtf_fetch` and `wtf_wikipedia` to download Wikipedia sources and convert the wiki sources "on-the-fly" into a RevealJS presentation.
* [Wikipedia2Wikiversity](https://niebert.github.io/Wikipedia2Wikiversity) that uses `wtf_fetch` to download Wikipedia sources and convert the links for application in Wikiversity.


## Decomposition of `wtf_wikipedia` in submodules
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
  console.log(doc.wiki);
});
```
***on the client-side:***
You can use the source library of `wtf_fetch` 
* with a script tag for testing or just add the build of `wtf_fetch.js` or 
* just view the library [`wtf_fetch.js`](https://niebert.github.io/js/wtf_fetch.js) and save the library to your local HTML project or
* get the library by cloning the `wtf_fetch.js` repository with `git clone https://github.com/niebert/wtf_fetch.git` from the command line.
```html 
<script src="https://niebert.github.io/js/wtf_fetch.js"></script>
<script>
  //(follows redirect)
  wtf_fetch.getPage('Water', 'en','wikiversity' function(err, doc) {
    // doc.wiki contains the download wiki markdown
    console.log(doc.wiki);
  });
</script>
```

# What it does:
* Downloads Wiki markup source for an article from a MediaWiki of the Wiki Foundation
* Allows different MediaWiki source, e.g. Wikipedia, Wikiversity, Wikivoyage, ...
* Creates a JSON with the following format stored as example in variable `wiki_json`:
```javascript
var wiki_json = {
  "wiki": "This is the content of the wiki article in wiki markdown ..."
  "title": "Swarm Intelligence",
  "lang": "en",
  "domain": "wikiversity",
  "url": "https://en.wikiversity.org/wiki/Swarm_Intelligence",
  "pageid": 2130123
}
```
If you want to access the Wiki markdown of the fetch article, access the `wiki_json.wiki`. The language and domain is stored in the JSON for the article because the attributes are helpful to expand relative links in the wiki to absolute links, that work also after having the document available on a other domain.

## Processing MediaWiki Markdown

The fetched wiki markdown e.g. from Wikipedia is in general processed within the browser or in the NodeJS application.

### wtf_wikipedia
The primary library for further processing is `wtf_wikipedia` by Spencer Kelly (see [wtf_wikipedia](https://www.github.com/spencermountain/wtf_wikipedia) ).

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

but getting structured data out of the Wiki source go ahead with Spencer Kelly library [wtf_wikipedia](https://www.github.com/spencermountain/wtf_wikipedia)

# API
* **wtf_fetch.getPage(title, [lang], [domain], [options], [callback])**

### outputs:
The callback or promise will get a JSON of the following type that contains the markdown content in the `wiki` property of the returned JSON:
```json
{
  "wiki": "This is the fetched markdown source of the article ...",
  "title": "My Wikipedia Title",
  "lang": "en",
  "domain": "wikpedia",
  "url": "https://en.wikipedia.org/wiki/My_Wikipedia_Title",
  "pageid": 12345  
}
```

## Language and Domainname
You can retrieve the Wiki markdown from different MediaWiki products of the WikiFoundation. The domain name includes the Wiki product (e.g. Wikipedia or Wikiversity) and a language. The WikiID encoded the language and the domain determines the API that is called for fetching the source Wiki. The following WikiIDs are referring to the following domain name.   
* Language: `en` Domain: `wikipedia`:
https://en.wikipedia.org
* Language: `de` Domain: `wikipedia`:  https://de.wikipedia.org
* Language: `fr` Domain: `wikipedia`:  https://fr.wikipedia.org
* Language: `en` Domain: `wikibooks`: https://en.wikibooks.org',
* Language: `en` Domain: `wikinews`: https://en.wikinews.org',
* Language: `en` Domain: `wikiquote`: https://en.wikiquote.org',
* Language: `en` Domain: `wikisource`: https://en.wikisource.org',
* Language: `en` Domain: `wikiversity`: https://en.wikiversity.org',
* Language: `en` Domain: `wikivoyage`: https://en.wikivoyage.org'



## Examples

### **wtf_fetch.getPage(title, [lang], [domain] [options], [callback])**
retrieves raw contents of a mediawiki article from the wikipedia action API.

This method supports the **errback** callback form, or returns a [Promise](https://spring.io/understanding/javascript-promises) if one is missing.

to call non-english wikipedia apis, add [it's language-name](http://en.wikipedia.org/w/api.php?action=sitematrix&format=json) as the second parameter

```javascript
wtf_fetch.getPage('Toronto', 'de', 'wikipedia', function(err, doc) {
  var url = "https://" + doc.lang + "." + doc.domain + ".org";
  console.log("Wiki JSON fetched from '" +
       url + "/wiki/" + doc.title + "'\n" + JSON.stringify(doc,null,4));
  //doc.wiki = "Toronto ist mit 2,6 Millionen Einwohnern..."
});
```
you may also pass the wikipedia page id as parameter instead of the page title:

```javascript
wtf_fetch.getPage(64646, 'de', 'wikipedia', function(err, doc) {
  console.log("Wiki JSON\n"+JSON.stringify(doc,null,4));
});

```
the fetch method follows redirects.

## **CLI**
if you're scripting this from the shell, or from another language, install with a `-g`, and then run:

```shell
$ node ./bin/wtf_fetch.js George Clooney de wikipedia
# George Timothy Clooney (born May 6, 1961) is an American actor ...

$ node ./bin/wtf_fetch.js 'Toronto Blue Jays' en wikipedia
```
Command Line Interface was not implement so far.

### Good practice:
The wikipedia api is [pretty welcoming](https://www.mediawiki.org/wiki/API:Etiquette#Request_limit) though recommends three things, if you're going to hit it heavily -
* 1️⃣ pass a `Api-User-Agent` as something so they can use to easily throttle bad scripts
* 2️⃣ bundle multiple pages into one request as an array
* 3️⃣ run it serially, or at least, [slowly](https://www.npmjs.com/package/slow).
```js
wtf_fetch.getPage(['Royal Cinema', 'Aldous Huxley'], 'en', 'wikipedia',{
  'Api-User-Agent': 'youremail@example.com'
}).then((docList) => {
  let allDocs = docList.map(doc => doc.wiki);
  console.log(allDocs);
});
```

## Create Office Documents
`wtf_fetch` is just the first step in creating other formats directly from the Wikipedia source by "on-the-fly" conversion after downloading the Wiki source e.g. from Wikipedia.

Creating an Office document is just one example of an output file. ODT-output is currently (2018/11/04) not part of `wtf_wikipedia` but you may want to play around with the `wtf_fetch` or `wtf_wikipedia` to parse the Wiki source and convert the file in your browser into an Office document. The following source will support a bit in creating the Office documents.

### PanDoc and ODF Editor
If you try [PanDoc document conversion](https://pandoc.org/try) the key to generate Office documents is the export format ODF.
[LibreOffice](https://en.wikipedia.org/wiki/LibreOffice) can load and save even the [OpenDocument Format](http://opendocumentformat.org/) and LibreOffice can load and save MICR0S0FT Office formats. So exporting to Open Document Format will be good option to start with in `wtf_wikipedia`. The following description are a summary of aspects that support developers in bringing the Office export format e.g. to web-based environment like the [ODF-Editor](http://webodf.org/demos/).
OpenDocument Format provides a comprehensive way forward for `wtf_wikipedia` to exchange documents from a `MediaWiki` source text reliably and effortlessly to different formats, products and devices. Regarding the different Wikis of the [Wiki Foundation](https://en.wikipedia.org/wiki/Wikimedia_Foundation) as a [Content Sink](https://en.wikiversity.org/wiki/Educational_Content_Sink) e.g. the educational content in [Wikiversity](https://en.wikiversity.org) is no longer restricted to a single export format (like PDF) open ups access to other specific editors, products or vendors for all your needs. With `wtf_wikipedia` and an ODF export format the users have the opportunity to choose the 'best fit' application of the Wiki content. This section focuses on Office products.

### Open Document Format ODT
Some important information to support Office Documents in the future
* see [WebODF](http://webodf.org/) how to [edit ODF documents on the web or display slides](http://webodf.org/demos/). Current limitation of WebODF is, that does not render mathematical expressions, but alteration in [WebODF editor](http://webodf.org/demos/) does not remove the mathematical expressions from the ODF file (state 2018/04/07). WebODF does not render the mathematical expressions but this may be solved in the WebODF-Editor by using [MathJax](https://www.mathjax.org/) or [KaTeX](https://khan.github.io/KaTeX/) in the future.
* The `ODT`-Format is the default export format of LibreOffice/OpenOffice. Supporting the [Open Community Approach](https://en.wikiversity.org/wiki/Open_Community_Approach) OpenSource office products are used to avoid commercial dependencies for using generated Office products.
  * The `ODT`-Format of LibreOffice is basically a [ZIP-File](https://en.wikipedia.org/wiki/Zip_(file_format)).
  * Unzip shows the folder structure within the ZIP-format. Create a subdirectory e.g.  with the name `zipout/`  and call `unzip mytext.odt -d zipout` (Linux, MacOSX).
  * The main text content is stored in `content.xml` as the main file for defining the content of Office document
  * Remark: Zipping the folder content again will create a parsing error when you load the zipped office document again in `LibreOffice`. This may be caused by an inappropriate order in the generated ZIP-file. The file `mimetype` [must be the first file in the ZIP-archive](https://crcok.wordpress.com/2014/10/25/unzip-and-zip-openoffice-org-odt-files/).
  * The best way to generate ODT-files is to generate an ODT-template `mytemplate.odt` with LibreOffice and all the styles you want to apply for the document and place a marker at specific content areas, where you want to replace the cross-compiled content with `wtf_wikipedia` in `content.xml`. The file  `content.xml` contains the text and can be updated in ODT-ZIP-file. If you want to have a MlCR0S0FT 0ffice output, just save the ODT-file in LibreOffice as Word-file. Also marker replacement is possible in ODF-files (see also [WebODF demos](http://webodf.org/demos/).
  * Image must be downloaded from the MediaWiki (e.g. with an NPM equivalent of `wget` for fetching the image, audio or video) and add the file to the folder structure in the ZIP. Create a ODT-file with LibreOffice with an image and unzip the ODT-file to learn about way how ODT stores the image in the ODT zip-file.
* [JSZip](https://stuk.github.io/jszip/): JSZip can be used to update and add certain files in a given ODT template (e.g. `mytemplate.odt`). Handling ZIP-files in a cross-compilation WebApp with `wtf_wikipedia` that runs in your browser and generates an editor environment for the cross-compiled Wiki source text (like the [WebODF editor](http://www.webodf.org/demo/ci/wodotexteditor-0.5.9/localeditor.html)). The updating the ODT template as ZIP-file can be handled with [JSZip](https://stuk.github.io/jszip/) by replacing the `content.xml` in a ZIP-archive. `content.xml` can be generated with `wtf_wikipedia` when the `odf`-export format is added to `/src/output/odf` (ToDo: Please create a pull request if you have done that).
* **LibreOffice Export:** Loading ODT-files in [LibreOffice](https://en.wikipedia.org/wiki/LibreOffice) allows to export the ODT-Format to
  * Office documents `doc`- and `docx`-format,  
  * Text files (`.txt`),
  * HTML files (`.html`),
  * Rich Text files (`.rtf`),
  * PDF files (`.pdf`) and even
  * PNG files (`.png`).
* Planing of the ODT support can be down in this README and collaborative implementation can be organized with Pull Requests PR.
* Helpful Libraries: [node-odt](https://www.npmjs.com/package/node-odt), [odt](https://www.npmjs.com/package/odt)

### Word Export with Javascript Libraries
* `wtf_wikipedia` supports HTML export,
* the library `html-docx-js` supports [cross-compilation of HTML into docx-format](https://www.npmjs.com/package/html-docx-js)


# Contributing
`wtf_fetch` is just a minor micro library to fetch the wiki markdown of an article in Wikipedia, Wikiversity, ... Please consider contribution to the `wtf_wikipedia` developed by Spencer Kelly - see [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) for further details and [join in!](https://github.com/spencermountain/wtf_wikipedia/contributing.md)

# Acknowledgement
This library extracted the `fetch` method from `wtf_wikipedia`. The complete code was developed by Spencer Kelly. `wtf_fetch` itself is based on
 [cross-fetch](https://github.com/lquixada/cross-fetch) which allows fetching the markdown of articles from Wikipedia, Wikiversity even from a local HTML file, that imports the `builds/wtf_fetch.js`. This is great because you can fetch an article from Wikipedia and process the article within a browser without the need to perform processing on a remote server. The library [jshashes](https://github.com/h2non/jshashes) was required as a lightweight library implementing the most extended cryptographic hash function algorithms in pure JavaScript. Special thanks to Spencer Kelly for creating and maintaining [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia). A great contribution to the OpenSource community especially for using Wiki content as [Open Educational Resources](https://en.wikiversity.org/wiki/Open_Educational_Resources).

See also:
* [`wtf_wikipedia`](https://github.com/spencermountain/wtf_wikipedia)
* [`wtf_tokenizer`](https://github.com/niebert/wtf_tokenizer)
* [instaview](https://en.wikipedia.org/wiki/User:Pilaf/InstaView)
* [txtwiki](https://github.com/joaomsa/txtwiki.js)
* [Parsoid](https://www.mediawiki.org/wiki/Parsoid)

MIT
