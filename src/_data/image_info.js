const cloudinary = require('cloudinary').v2;
const fs = require("fs");

module.exports = (async function() {

  if(process.env.IMAGES != 'true') {
    console.log('Using image-info cache');
    const cache = require('../../_cache/image-info.json');
    return cache;
  }

  var resources = [];

  var result = await cloudinary.search.with_field('context').max_results(500).execute();
  // var result = await cloudinary.api.resources({context:true,max_results:500});
  resources = resources.concat(result.resources);

  while(result.next_cursor) {
    result = await cloudinary.search.with_field('context').max_results(500).next_cursor(result.next_cursor).execute();
    // result = await cloudinary.api.resources({context:true,max_results:500,next_cursor:result.next_cursor});
    resources = resources.concat(result.resources);
  }

  console.log('Updating image-info');
  fs.writeFileSync('_cache/image-info.json', JSON.stringify(resources, null, 2));

  return resources;

})();
