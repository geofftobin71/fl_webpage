if(process.env.NODE_ENV != 'deploy') {
      require("dotenv").config();
}
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const svgContents = require("eleventy-plugin-svg-contents");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const { Settings, DateTime } = require("luxon"); 
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const jsonminify = require("jsonminify");
const fs = require("fs");
const markdown = require("markdown-it")({ html: true }).disable('code');
const fetch64 = require('fetch-base64');
const site = require('./src/_data/site.json');
const image_sizes = require('./src/_data/image_sizes.json');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

Settings.defaultZoneName = "Pacific/Auckland";

markdown.renderer.rules.image = function (tokens, idx, options, env, self) {
  const srcfilename = tokens[idx].attrs[0][1];
  const title_txt = tokens[idx].attrs[2][1];
  const public_id = srcfilename.replace('https://res.cloudinary.com/floriade/image/upload', '').replace(/\/v[0-9]+/, '').replace(/\.[a-zA-Z0-9]+$/, '').replace(/^\//,'');

  let caption = '';
  if(title_txt) {
    caption = '<figcaption class="caption">' + markdown.utils.escapeHtml(title_txt) + '</figcaption>';
  }

  let alt = ' alt="' + self.renderInlineAsText(tokens, options, env) + '"';

  if(alt == ' alt=""') {
    alt = ' alt="Flowers by Floriade"';
  }

  let transforms = ",c_fill,ar_1,q_auto,f_auto,g_auto:subject/";
  let src = site.cloudinary_url + '/w_900' + transforms + public_id;

  let srcset = ' data-srcset="';
  let first = true;
  image_sizes.forEach(size => {
    if(!first) { srcset += ','; }
    srcset += site.cloudinary_url + '/w_' + size + transforms + public_id + ' ' + size + 'w';
    first = false;
  });
  srcset += '"';

  let sizes = ' sizes="(min-width: 900px) 900px, 100vw"';

  let lqip_path = site.cloudinary_url + "/c_fill,w_64,h_64,q_auto,f_jpg,g_auto:subject,e_blur:200/" + public_id;

  return '<figure><noscript><img class="round shadow" width="1200" height="1200"' + alt + ' src="' + src + '" style="background-image:url(' + lqip_path + ')" loading="lazy" decoding="async" /></noscript><img class="round shadow" width="1200" height="1200"' + alt + ' src="' + site.transgif + '"' + srcset + sizes + 'data-src="' + src + '" style="background-image:url(' + lqip_path + ')" loading="lazy" decoding="async" />'
    + caption + '</figure>';
}

module.exports = (eleventyConfig) => {

  eleventyConfig.on('beforeBuild', () => {
    let products = JSON.parse(fs.readFileSync('src/_data/shop_products.json'));
    products.forEach(product => {
      if(!product.id) {
        const buf = crypto.randomBytes(4);
        product.id = buf.toString('hex');
      }
      product.variants.forEach(variant => {
        if(!variant.id) {
          const buf = crypto.randomBytes(4);
          variant.id = buf.toString('hex');
        }
      });
    });
    fs.writeFileSync('src/_data/shop_products.json', JSON.stringify(products, null, 2));
  });

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPlugin(svgContents);

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://floriade.co.nz",
    },
  });

  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.addCollection("blog", (collection) => {
    const today = DateTime.local().set({hours:0,minutes:0,seconds:0,milliseconds:0});
    const livePosts = (p) => { 
      const post_date = DateTime.fromJSDate(p.date).set({hours:0,minutes:0,seconds:0,milliseconds:0});
      return (post_date <= today) && (!p.data.draft);
    }

    const coll = collection.getFilteredByGlob("./src/blog/*.md").filter(livePosts).reverse();

    for(let i = 0; i < coll.length ; i++) {
      const prevPost = coll[i-1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
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
  eleventyConfig.addPassthroughCopy({"./src/_data/shop_categories.json" : "/php/shop_categories.json"});
  eleventyConfig.addPassthroughCopy({"./src/_data/shop_products.json" : "/php/shop_products.json"});

  eleventyConfig.addShortcode("markdown",
    content => `${markdown.render(content)}`
  );

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

  eleventyConfig.addNunjucksAsyncFilter("imgInfo", async (id, callback) => {
    let info = await cloudinary.search
      .expression('public_id=' + id)
      .with_field('context')
      .execute();

    // console.log(info.rate_limit_remaining + ' / ' + info.rate_limit_allowed);
    callback(null, info.resources[0]);
  });

  eleventyConfig.addNunjucksAsyncFilter("imgGallery", async (folder, callback) => {
    let gallery = await cloudinary.search
      .expression('folder=' + folder)
      .sort_by('public_id','desc')
      .with_field('context')
      .max_results(500)
      .execute();

    // console.log(gallery.rate_limit_remaining + ' / ' + gallery.rate_limit_allowed);
    callback(null, gallery.resources);
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
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  });

  eleventyConfig.addFilter("removeLongReviews", (array, limit) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].review.length <= limit) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("removeEmpty", (array) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].key.length) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("filterByCategory", (array, category) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].category === category) { filtered[filtered.length] = array[i]; }
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
