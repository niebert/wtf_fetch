#!/usr/bin/env node
var wtf = require('../src/index');
var args = process.argv.slice(2, process.argv.length);

const options = {
  'Api-User-Agent': 'wtf_fetch example'
};

/*
(async () => {
  //there's a good list here
  // https://en.wikipedia.org/wiki/List_of_Apollo_astronauts
  let doc = await wtf.fetch('List of Apollo astronauts', options);

  console.log(JSON.stringify(doc,null,4));
})();
*/
let title = "Water";
let lang = "en";
let domain = "wikipedia"; // wikiversity, wikivoyage, ...
if (args.length > 0) {
  // set title from parameters
  title = args[0];
  if (args.length > 1) {
    // set language from parameters
    lang = args[1];
    if (args.length > 2) {
      // set domain from parameters
      domain = args[2];
    }
  };
  (async () => {
    //there's a good list here
    // https://en.wikipedia.org/wiki/List_of_Apollo_astronauts
    let doc = await wtf.getPage(title, lang ,domain, options);

    if (doc.hasOwnProperty("wiki")) {
      // shorten wiki source
      console.log("REMARK: doc.wiki: Wiki Source was shorted!");
      doc.wiki = doc.wiki.substr(0,100) + "...";
    }
    console.log(JSON.stringify(doc,null,4));
  })();

  console.log("\n\nArguuments: "+JSON.stringify(args));

} else {
  console.log("CALL: node ./bin/wtf_fetch title lang domain \n    For title with blanks: 'my title with blanks' or underscore  my_title_with_blanks ");
}
/*
 LIST OF ARTICLES IN PARAMETERS
node ./bin/wtf_fetch "Water" "Swarm intelligence"
*/
/*
if (args.length > 0) {
  for (var i = 0; i < args.length; i++) {
    let title = args[i];
    (async () => {
      //there's a good list here
      // https://en.wikipedia.org/wiki/List_of_Apollo_astronauts
      let doc = await wtf.getPage(title, "en","wikipedia", options);

      console.log(JSON.stringify(doc,null,4));
    })();


  }
} else {
  console.log("CALL: node ./bin/wtf_fetch title1 title2 'title with blanks' ");
}
*/
