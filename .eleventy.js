const { DateTime } = require("luxon"); 

module.exports = function (config) {
  
  config.addCollection("posts", function (collection) {
    return collection.getFilteredByGlob("posts/*.md");
  });
  
  config.addPassthroughCopy("css");
  config.addPassthroughCopy("fonts");
  config.addPassthroughCopy("scripts");
  
  config.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  config.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  config.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

};
