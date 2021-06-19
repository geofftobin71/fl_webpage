const cloudinary = require('cloudinary').v2;

module.exports = (async function() {

  var resources = [];

  var result = await cloudinary.search.with_field('context').max_results(500).execute();
  // var result = await cloudinary.api.resources({context:true,max_results:500});
  resources = resources.concat(result.resources);

  while(result.next_cursor) {
    result = await cloudinary.search.with_field('context').max_results(500).next_cursor(result.next_cursor).execute();
    // result = await cloudinary.api.resources({context:true,max_results:500,next_cursor:result.next_cursor});
    resources = resources.concat(result.resources);
  }

  return resources;

})();
