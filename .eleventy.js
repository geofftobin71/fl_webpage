if(process.env.NODE_ENV === 'development') {
      require("dotenv").config();
}
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const svgContents = require("eleventy-plugin-svg-contents");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const schema = require("@quasibit/eleventy-plugin-schema");
const { DateTime } = require("luxon"); 
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const fs = require("fs");
const markdown = require("markdown-it")({ html: true });

module.exports = function (eleventyConfig) {

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPlugin(svgContents);

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://floriade.co.nz",
    },
  });

  eleventyConfig.addPlugin(schema);

  eleventyConfig.addCollection("posts", function (collection) {
    return collection.getFilteredByGlob("./src/posts/*.md");
  });

  eleventyConfig.addPassthroughCopy({"./src/favicon/*.ico" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.png" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.svg" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.xml" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.webmanifest" : "/"});
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/php");
  eleventyConfig.addPassthroughCopy("./admin");

  eleventyConfig.addShortcode("markdown",
    content => `${markdown.render(content)}`
  );

  // [300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1650, 1800, 1950, 2100, 2250, 2400]

  eleventyConfig.srcsetWidths = [ 600, 900, 1200, 1500, 1800, 2100, 2400 ];
  eleventyConfig.fallbackWidth = 900;

  eleventyConfig.addShortcode("respimg", (path, alt, sizes, transforms, classes, lazy ) => {
    const cloudinary = `https://res.cloudinary.com/floriade`;
    const src = `${cloudinary}/${transforms ? transforms : 'q_auto,f_auto'},w_${eleventyConfig.fallbackWidth}/${path}`;
    const srcset = eleventyConfig.srcsetWidths.map(w => {
      return `${cloudinary}/${transforms ? transforms : 'q_auto,f_auto'},w_${w}/${path} ${w}w`;
    }).join(', ');

    if(lazy) {
      return `<noscript><img srcset="${srcset}" sizes="${sizes ? sizes : '100vw'}" src="${src}" alt="${alt ? alt : 'Flowers by Floriade'}" class="${classes ? classes : ''}"></noscript><img data-srcset="${srcset}" sizes="${sizes ? sizes : '100vw'}" data-src="${src}" alt="${alt ? alt : 'Flowers by Floriade'}" class="${classes ? classes : ''}" loading="lazy">`;
    } else {
      return `<img srcset="${srcset}" sizes="${sizes ? sizes : '100vw'}" src="${src}" alt="${alt ? alt : 'Flowers by Floriade'}" class="${classes ? classes : ''}">`;
    }
  });

  eleventyConfig.addNunjucksAsyncFilter("jsmin", async function(code, callback) {
    try {
      if(process.env.NODE_ENV != 'development') {
        const minified = await minify(code);
        callback(null, minified.code);
      } else {
        callback(null, code);
      }
    } catch (err) {
      console.error("Terser error: ", err);
      // Fail gracefully.
      callback(null, code);
    }
  });

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( (process.env.NODE_ENV != 'development') && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addFilter("cssmin", function(code) {
    if(process.env.NODE_ENV != 'development') {
      return new CleanCSS({}).minify(code).styles;
    } else {
      return code;
    }
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return dateObj.toFormat("dd LLL yyyy");
    // return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return dateObj.toFormat('yyyy-LL-dd');
    // return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter("shuffle", (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  });

  eleventyConfig.addFilter("removeLongReviews", (array, limit) => {
    var filtered = [];
    for (var i = 0; i < array.length; ++i) {
      if(array[i].review.length <= limit) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  // Convert uppercase to hyphen-lowercase : fooBar => foo-bar
  eleventyConfig.addFilter("hyphenate", (word) => {
    function upperToHyphenLower(match, offset, string) {
      return (offset > 0 ? '-' : '') + match.toLowerCase();
    }
    return word.replace(/[A-Z]/g, upperToHyphenLower);
  });

  eleventyConfig.addFilter("stripVersion", (path) => {
    return path.replace(/^\/v[0-9]+/, '').replace(/\.[a-zA-Z0-9]+$/, '');
  });

  eleventyConfig.setBrowserSyncConfig({
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
