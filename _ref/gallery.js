var cloudinary = require('cloudinary').v2;

module.exports = function() {

  const gallery_name = "dried-flowers";

  return cloudinary.search
    .expression('folder=' + gallery_name)
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => { return result.resources; });
    // .then(result=>console.log(JSON.stringify(result, null, 4)));
};
