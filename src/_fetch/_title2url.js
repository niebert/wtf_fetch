/* FILE: /src/_fetch/_title2url
   function that converts a title from domain Wikipedia, Wikiversity, .... and
   a specific language "lang" and a domain "wikipedia", "wikiversity" into
   an URL that displays the source e.g.
   https://en.wikiversity.org/wiki/Swarm_intelligence
   default language is: "en"
   default domain is: "wikipedia"
*/

const title2url = function( title, lang, domain ) {
  // set default values for parameters
   title = title || "Main Page";
   domain = domain || "wikipedia";
   lang = lang || "en";
   // replace blank to underscore
   title=title.replace(/ /g,'_');
   title = encodeURIComponent(title);
   let url=`https://${lang}.${domain}.org/wiki/${title}}`;

   return url;
};

module.exports = title2url;
