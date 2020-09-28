require("dotenv").config();
const { DateTime } = require("luxon"); 
const htmlmin = require("html-minifier");
const fs = require("fs");

module.exports = function (config) {
  
  config.addCollection("posts", function (collection) {
    return collection.getFilteredByGlob("./src/posts/*.md");
  });
  
  config.addPassthroughCopy("./src/css/*.css");
  config.addPassthroughCopy("./src/fonts");
  config.addPassthroughCopy("./src/scripts");
  config.addPassthroughCopy("./src/images");

  config.addTransform("htmlmin", function(content, outputPath) {
    if( (process.env.ELEVENTY_ENV == "production") && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

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

  config.addFilter("shuffle", (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  });

  // Convert uppercase to hyphen-lowercase : fooBar => foo-bar
  config.addFilter("hyphenate", (word) => {
    function upperToHyphenLower(match, offset, string) {
      return (offset > 0 ? '-' : '') + match.toLowerCase();
    }
    return word.replace(/[A-Z]/g, upperToHyphenLower);
  });

  config.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {

        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync('dist/404.html');
          // Provides the 404 content without redirect.
          res.write(content_404);
          // Add 404 http status code in request header.
          // res.writeHead(404, { "Content-Type": "text/html" });
          res.writeHead(404);
          res.end();
        });
      }
    }
  });

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: "src",
      output: "dist"
    },
    passthroughFileCopy:true
  };
};
