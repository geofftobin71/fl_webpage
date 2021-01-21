const cloudinary = require('cloudinary').v2;
const cache = require('../../_cache/wedding_flowers_gallery.json');

module.exports = function() {
  if(process.env.NODE_ENV == 'develop') { console.log('Using Wedding Flowers gallery cache'); return cache; }

  console.log('Updating Wedding Flowers gallery');

  return cloudinary.search
    .expression('folder=wedding-flowers')
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => {
      // console.log(JSON.stringify(result.resources, null, 2));
      return result.resources;
    });
};
