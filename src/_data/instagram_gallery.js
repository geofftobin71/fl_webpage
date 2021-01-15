const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');

async function getImage(item) {
  return Promise.resolve(cloudinary.uploader.upload(item.thumbnail_url ? item.thumbnail_url : item.media_url,
    {
      public_id: 'instagram/floriade_wellington_' + item.id,
      use_filename: true,
      unique_filename: false,
      resource_type: 'image',
      overwrite: false,
      async: false,
      context: 'caption=' + item.caption + '|timestamp=' + item.timestamp
    }, 
    function(error, result) { /* console.log(result); */ }));
};

async function getImages(json_data) {
  return Promise.all(json_data.map((item) => getImage(item)));
};

module.exports = function() {
  fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + process.env.INSTAGRAM_TOKEN)
    .then(res => res.json())
    .then(json => console.log(json));

  return fetch('https://graph.instagram.com/me/media?fields=id,media_url,thumbnail_url,caption,timestamp&access_token=' + process.env.INSTAGRAM_TOKEN)
    .then(res => res.json())
    .then(json => {
      return getImages(json.data)
        .then(() => {
          return cloudinary.search
            .expression('folder=instagram')
            .with_field('context')
            .max_results(50)
            .execute()
            .then(result => {
              // console.log(JSON.stringify(result.resources, null, 2));
              return result.resources;
            });
        });
    });
};

