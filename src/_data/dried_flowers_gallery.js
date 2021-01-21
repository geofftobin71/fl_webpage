const cloudinary = require('cloudinary').v2;
const cache = require('../../_cache/dried_flowers_gallery.json');

module.exports = function() {
  if(process.env.NODE_ENV == 'develop') { console.log('Using Dried Flowers gallery cache'); return cache; }

  console.log('Updating Dried Flowers gallery');

  return cloudinary.search
    .expression('folder=dried-flowers')
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => {
      // console.log(JSON.stringify(result.resources, null, 2));
      return result.resources;
    });
};
