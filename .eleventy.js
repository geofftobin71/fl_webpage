module.exports = function (config) {
  
  config.addCollection("posts", function (collection) {
    return collection.getFilteredByGlob("src/site/posts/*.md");
  });

  return {
    dir: {
      input: "src/site",
      includes: "_includes",
      output: "_site",
    },
  };
};
