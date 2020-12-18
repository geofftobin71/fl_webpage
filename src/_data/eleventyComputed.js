var cloudinary = require('cloudinary').v2;

const gallery_images = (folder) => {

  if(!folder) { return; }

  return cloudinary.search
    .expression('folder:' + folder)
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => {
      console.log(result.resources);
      return result.resources;
    });
};

module.exports = {

  gallery: (data) => gallery_images(data.gallery_folder)

};
