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
const path = require("path");
const glob = require("glob");
const markdown = require("markdown-it")({ html: true }).disable('code');
const fetch = require('node-fetch');
const fetch64 = require('fetch-base64');
const site = require('./src/_data/site.json');
const image_sizes = require('./src/_data/image_sizes.json');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

var image_info_exists = false;
var image_info_written = false;

var shop_products = JSON.parse(fs.readFileSync('src/_data/shop_products.json'));
var shop_categories = JSON.parse(fs.readFileSync('src/_data/shop_categories.json'));

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

function minifyCopy(input, output) {
  let data = fs.readFileSync(input, 'utf8');

  if(process.env.NODE_ENV != 'develop') {
    let minified = data.replace(/\s+\/\/.*?\n/g, '').replace(/\/\*[^]*?\*\//g, '').replace(/[ \f\r\t\v\u00A0\u2028\u2029]+/g, ' ').replace(/\s*\n+/g, '\n').replace(/^\s+/gm, '').replace(/\s*$/gm, '').replace(/\n/g, ' ').replace(/\s*\;\s*/g, ';').replace(/\s*\:\s*/g, ':').replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}').replace(/\s*\[\s*/g, '[').replace(/\s*\]\s*/g, ']');
    fs.writeFileSync(output, minified);
  } else {
    fs.writeFileSync(output, data);
  }
}

module.exports = (eleventyConfig) => {

  eleventyConfig.on('beforeBuild', () => {

    // Fix shop_closed_dates and non_delivery_dates to have two digit dates
    let shop_closed_dates = JSON.parse(fs.readFileSync('src/_data/shop_closed_dates.json'));
    shop_closed_dates.forEach((date, i, dates) => {
      if(!isNaN(parseInt(date[0])) && isNaN(parseInt(date[1]))) { dates[i] = '0' + date; }
    });
    fs.writeFileSync('src/_data/shop_closed_dates.json', JSON.stringify(shop_closed_dates, null, 2));

    let non_delivery_dates = JSON.parse(fs.readFileSync('src/_data/non_delivery_dates.json'));
    non_delivery_dates.forEach((date, i, dates) => {
      if(!isNaN(parseInt(date[0])) && isNaN(parseInt(date[1]))) { dates[i] = '0' + date; }
    });
    fs.writeFileSync('src/_data/non_delivery_dates.json', JSON.stringify(non_delivery_dates, null, 2));

    // Add unique IDs to products
    shop_products.forEach(product => {
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
    fs.writeFileSync('src/_data/shop_products.json', JSON.stringify(shop_products, null, 2));

    // Upate Stock
    if(process.env.NODE_ENV != 'deploy') {
      fetch('http://168.138.10.72/php/update-stock.php');
    } else {
      fetch('https://floriade.co.nz/php/update-stock.php');
    }

    // Minify Copy PHP files
    if(!fs.existsSync("./dist/php/")) { fs.mkdirSync("./dist/php/", true); }
    minifyCopy("./src/_data/shop_categories.json", "./dist/php/shop_categories.json");
    minifyCopy("./src/_data/shop_products.json", "./dist/php/shop_products.json");
    minifyCopy("./src/_data/delivery_fees.json", "./dist/php/delivery_fees.json");
    minifyCopy("./src/_data/flat_rate_delivery_fees.json", "./dist/php/flat_rate_delivery_fees.json");

    glob('./src/php/*.php', (err, files) => {
      if(err) {
        console.log(err);
      } else {
        files.forEach((file) => {
          minifyCopy(file, "./dist/php/" + path.basename(file));
        });
      }
    });
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
      // const post_date = DateTime.fromISO(p.date).set({hours:0,minutes:0,seconds:0,milliseconds:0});
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
  eleventyConfig.addPassthroughCopy("./admin");
  // eleventyConfig.addPassthroughCopy("./src/js");
  // eleventyConfig.addPassthroughCopy("./src/php");
  // eleventyConfig.addPassthroughCopy({"./src/_data/shop_categories.json" : "/php/shop_categories.json"});
  // eleventyConfig.addPassthroughCopy({"./src/_data/shop_products.json" : "/php/shop_products.json"});
  // eleventyConfig.addPassthroughCopy({"./src/_data/delivery_fees.json" : "/php/delivery_fees.json"});

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

  eleventyConfig.addNunjucksAsyncFilter("imgLqip", async (path, callback) => {
    let base64 = await fetch64.remote(path).catch((err) => {
      console.error("LQIP error: ", err);
      callback(null, path);
    });
    let preview = "data:image/jpg;base64," + base64[0];
    callback(null, preview);
  });

  eleventyConfig.addNunjucksAsyncFilter("imgInfo", async (id, callback) => {
    if(process.env.NODE_ENV != 'develop') {
      if(!image_info_exists) {
        image_info_exists = true;

        let resources = [];

        let result = await cloudinary.search
          .with_field('context')
          .max_results(500)
          .execute();

        resources = resources.concat(result.resources);

        while(result.next_cursor) {
          result = await cloudinary.search
            .next_cursor(result.next_cursor)
            .with_field('context')
            .max_results(500)
            .execute();

          resources = resources.concat(result.resources);
        }

        console.log('Updating image-info');
        fs.writeFileSync('_cache/image-info.json', JSON.stringify(resources, null, 2));
        image_info_written = true;
      }

      while(!image_info_written) {}
    } else {
      if(!image_info_exists) {
        image_info_exists = true;
        console.log('Using image-info cache');
      }
    }

    let resources = JSON.parse(fs.readFileSync('_cache/image-info.json'));

    resources.forEach(resource => {
      if(resource.public_id === id) {
        callback(null, resource);
      }
    });
  });

  eleventyConfig.addNunjucksAsyncFilter("imgGallery", async (folder, callback) => {
    let gallery = {}

    if(process.env.NODE_ENV == 'develop') {
      console.log('Using ' + folder + '-gallery cache');

      gallery = JSON.parse(fs.readFileSync('_cache/' + folder + '-gallery.json'));
    } else {
      gallery = await cloudinary.search
        .expression('folder=' + folder)
        .sort_by('public_id','desc')
        .with_field('context')
        .max_results(500)
        .execute();

      if(gallery && gallery.resources && gallery.resources.length) {
        if(process.env.NODE_ENV == 'build') {
          // console.log(gallery.rate_limit_remaining + ' / ' + gallery.rate_limit_allowed);
          console.log('Updating ' + folder + '-gallery');

          fs.writeFileSync('_cache/' + folder + '-gallery.json', JSON.stringify(gallery, null, 2));
        }
      } else {
        console.log('Using ' + folder + '-gallery cache (fallback)');
        gallery = JSON.parse(fs.readFileSync('_cache/' + folder + '-gallery.json'));
      }
    }

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

  eleventyConfig.addTransform("minifyphp", (content, outputPath) => {
    if( (process.env.NODE_ENV != 'develop') && outputPath.endsWith(".php") ) {
      return content.replace(/\s+\/\/.*?\n/g, '').replace(/\/\*[^]*?\*\//g, '').replace(/[ \f\r\t\v\u00A0\u2028\u2029]+/g, ' ').replace(/\s*\n+/g, '\n').replace(/^\s+/gm, '').replace(/\s*$/gm, '').replace(/\n/g, ' ');
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
    return DateTime.fromISO(dateObj).toFormat("dd LLL yyyy");
    // return DateTime.fromJSDate(dateObj, {zone: 'Pacific/Auckland'}).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromISO(dateObj).toFormat('yyyy-LL-dd');
    // return DateTime.fromJSDate(dateObj, {zone: 'Pacific/Auckland'}).toFormat('yyyy-LL-dd');
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

  eleventyConfig.addFilter("filterWeddingReviews", (array, wedding) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].wedding == wedding) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("cleanUrl", (url) => {
    return url.replace("index.php","");
  });

  eleventyConfig.addFilter("removeEmpty", (array) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      array[i].url = array[i].url.replace("index.php","");
      if(array[i].key.length) { 
        filtered[filtered.length] = array[i]; 
      }
    }
    return filtered;
  });

  eleventyConfig.addFilter("validProductVariants", (array) => {
    let filtered = [];
    if(!array) { return filtered; }
    for (let i = 0; i < array.length; ++i) {
      if(!array[i].disabled) { 
        filtered[filtered.length] = array[i]; 
      }
    }
    return filtered;
  });

  eleventyConfig.addFilter("hasVariants", (product) => {
    return ((product.variants) && (product.variants.length > 0));
  });

  eleventyConfig.addFilter("hasStock", (product) => {
    let has_stock = false;

    if(product.stock) { has_stock = true; }

    product.variants.forEach(variant => {
      if(variant.stock) { has_stock = true; }
    });

    return has_stock;
  });

  eleventyConfig.addFilter("filterByCategory", (array, category) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].category === category) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("listParents", (product) => {
    let category;
    let result = "";
    let first = true;

    shop_categories.forEach(cat => {
      if(cat.name === product.category) {
        category = cat;
      }
    });

    category.parents.forEach(parent => {
      if(!first) { result += " or "; }
      result += parent;
      first = false;
    });

		return result;
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

  eleventyConfig.addFilter("formatMoney", (price) => {
    if(price == 0) { return 'free'; }
    if(Math.floor(price) == (price)) {
      return '$' + (price);
    } else {
      return '$' + (price).toFixed(2);
    }
  });

  eleventyConfig.addFilter("iconTextButton", (svg) => {
    return (svg) ? svg.replace('<svg ', '<svg class="button-icon" aria-hidden="true" focusable="false" ') : '';
  });

  eleventyConfig.addFilter("iconButton", (svg) => {
    return (svg) ? svg.replace('<svg ', '<svg class="icon-button-icon" aria-hidden="true" focusable="false" ') : '';
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
