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
const fetch64 = require('fetch-base64');

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

  eleventyConfig.addShortcode("respimg", (opt) => {
    const cloudinary = `https://res.cloudinary.com/floriade`;
    const src = `${cloudinary}/${opt.transforms ? opt.transforms : 'q_auto,f_auto'},w_${eleventyConfig.fallbackWidth}/${opt.path}`;
    const preview = `${cloudinary}/c_limit,w_64,h_64,f_jpg,e_blur:200/${opt.path}`;
    const srcset = eleventyConfig.srcsetWidths.map(w => {
      return `${cloudinary}/${opt.transforms ? opt.transforms : 'q_auto,f_auto'},w_${w}/${opt.path} ${w}w`;
    }).join(', ');

    if(opt.lazy) {
      return `<noscript><img srcset="${srcset}" sizes="${opt.sizes ? opt.sizes : '100vw'}" src="${src}" alt="${opt.alt ? opt.alt : 'Flowers by Floriade'}" class="${opt.classes ? opt.classes : ''}"></noscript><img data-srcset="${srcset}" sizes="${opt.sizes ? opt.sizes : '100vw'}" data-src="${src}" src="${opt.lqip_image ? opt.lqip_image : preview}" alt="${opt.alt ? opt.alt : 'Flowers by Floriade'}" class="${opt.classes ? opt.classes : ''}" loading="lazy">`;
    } else {
      return `<img srcset="${srcset}" sizes="${opt.sizes ? opt.sizes : '100vw'}" src="${src}" alt="${opt.alt ? opt.alt : 'Flowers by Floriade'}" class="${opt.classes ? opt.classes : ''}">`;
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

  eleventyConfig.addNunjucksAsyncFilter("lqip", async function(path, callback) {
    let base64 = await fetch64.remote(path).catch((err) => {
      console.error("LQIP error: ", err);
      callback(null, path);
    });
    let preview = "data:image/jpeg;base64," + base64[0];
    callback(null, preview);
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
    return path.replace(/\/v[0-9]+/, '').replace(/\.[a-zA-Z0-9]+$/, '');
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
