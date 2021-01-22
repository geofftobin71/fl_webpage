if(process.env.NODE_ENV != 'deploy') {
      require("dotenv").config();
}
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const svgContents = require("eleventy-plugin-svg-contents");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const schema = require("@quasibit/eleventy-plugin-schema");
const { Settings, DateTime } = require("luxon"); 
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const jsonminify = require("jsonminify");
const fs = require("fs");
const markdown = require("markdown-it")({ html: true });
const fetch64 = require('fetch-base64');

Settings.defaultZoneName = "Pacific/Auckland";

module.exports = (eleventyConfig) => {

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPlugin(svgContents);

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://floriade.co.nz",
    },
  });

  eleventyConfig.addPlugin(schema);

  eleventyConfig.addCollection("blog", (collection) => {
    const now = DateTime.local();
    const livePosts = p => p.date <= now && !p.data.draft;
    return collection.getFilteredByGlob("./src/blog/*.md").filter(livePosts).reverse();
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

  eleventyConfig.addNunjucksAsyncFilter("jsmin", async (code, callback) => {
    try {
      if(process.env.NODE_ENV != 'develop') {
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

  eleventyConfig.addNunjucksAsyncFilter("lqip", async (path, callback) => {
    let base64 = await fetch64.remote(path).catch((err) => {
      console.error("LQIP error: ", err);
      callback(null, path);
    });
    let preview = "data:image/jpg;base64," + base64[0];
    callback(null, preview);
  });

  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if( (process.env.NODE_ENV != 'develop') && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addFilter("cssmin", (code) => {
    if(process.env.NODE_ENV != 'develop') {
      return new CleanCSS({}).minify(code).styles;
    } else {
      return code;
    }
  });

  eleventyConfig.addFilter("jsonmin", (code) => {
    if(process.env.NODE_ENV != 'develop') {
      return jsonminify(code);
    } else {
      return code;
    }
  });

  eleventyConfig.addFilter("splitHours", (hours, index) => {
    return hours.split('-')[index].trim();
  });

  eleventyConfig.addFilter("twentyFour", (time, ampm = 'pm') => {
    let pm = (ampm == 'pm');

    if(time.trim().slice(-2).toLowerCase() == 'am') { pm = false; }
    if(time.trim().slice(-2).toLowerCase() == 'pm') { pm = true; }

    const bits = time.split(/[^0-9]/);

    let hour_num = ((bits.length > 0) && (bits[0])) ? parseInt(bits[0]) : 0;
    hour_num += ((hour_num < 12) && (pm) ? 12 : 0);

    let minute_num = ((bits.length > 1) && (bits[1])) ? parseInt(bits[1]) : 0;

    const hour = ('00' + hour_num).slice(-2);
    const minute = ('00' + minute_num).slice(-2);

    return hour + ':' + minute;
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'Pacific/Auckland'}).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'Pacific/Auckland'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter("sortISO8601", (array) => {
    return array.sort((a, b) => {
      return (a.context.timestamp < b.context.timestamp) ? -1 : ((a.context.timestamp > b.context.timestamp) ? 1 : 0);
    });
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
    return (path) ? path.replace(/\/v[0-9]+/, '').replace(/\.[a-zA-Z0-9]+$/, '').replace(/^\//,'') : '';
  });

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: (err, bs) => {

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
