var cloudinary = require('cloudinary').v2;

module.exports = function() {

  return cloudinary.search
    .expression('folder:wedding-flowers')
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => { return result; });
    // .then(result=>console.log(JSON.stringify(result, null, 4)));
};
