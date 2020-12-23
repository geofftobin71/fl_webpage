const cloudinary = require('cloudinary').v2;
const fetch = require('fetch-base64');

const getPreview = async (item) => {
  let newItem = {};
  newItem.public_id = item.public_id;
  newItem.width = item.width;
  newItem.height = item.height;
  newItem.aspect_ratio = item.aspect_ratio;
  if(item.context) {
    newItem.context = item.context;
  }

  let source = "https://res.cloudinary.com/floriade/c_limit,w_32,h_32,f_jpg,e_blur:200/" + item.public_id;
  let base64 = await fetch.remote(source);
  newItem.preview = "data:image/jpeg;base64," + base64[0];

  return (newItem);
}

const getPreviews = async (list) => {
  return Promise.all(list.map(item => getPreview(item)));
}

const gallery_images = (folder) => {

  if(!folder) { return };

  return cloudinary.search
    .expression('folder:' + folder)
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then( result => {
      return getPreviews(result.resources)
        .then( final => { 
          console.log(JSON.stringify(final));
          return final;
        });
    });
}

module.exports = {

  gallery: (data) => gallery_images(data.gallery_folder)

}
