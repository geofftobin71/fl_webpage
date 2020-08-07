module.exports = function (config) {
  
  config.addCollection("posts", function (collection) {
    return collection.getFilteredByGlob("posts/*.md");
  });

  config.addPassthroughCopy("css");
};
