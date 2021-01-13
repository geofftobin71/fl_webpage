const fs = require('fs');
const fetch = require('node-fetch');
const sharp = require('sharp');
const murmurhash = require('murmurhash');

async function getImage(item, index) {
  let newItem = {};
  newItem.source = item.thumbnail_url ? item.thumbnail_url : item.media_url;
  newItem.caption = item.caption;

  const response = await fetch(newItem.source);
  const buffer = await response.buffer();
  const path = '/images/instagram/';
  // const filename = 'floriade_wellington_' + ('0000' + (index + 1)).slice(-4) + '.jpg';
  const filename = 'floriade_wellington_' + murmurhash.v3(newItem.source.split('?',1)[0]) + '.jpg';

  newItem.image = path + filename;
  newItem.thumbnail = path + 'thumbs/' + filename;

  fs.writeFileSync('dist' + newItem.image, buffer);
  console.log('Cached ' + newItem.image);

  sharp('dist' + newItem.image)
    .resize(460, 460)
    .toFile('dist' + newItem.thumbnail)
    .then(() => {
      console.log('Cached ' + newItem.thumbnail);
    });

  return sharp('dist' + newItem.image)
    .resize(64, 64)
    .blur(2)
    .toBuffer()
    .then((data) => {
      newItem.preview = "data:image/jpeg;base64," + data.toString('base64');
      // if(item.media_type == 'VIDEO') { newItem.image = item.media_url; }
      // console.log(JSON.stringify(newItem, null, 2));
      return newItem;
    });
};

const getImages = async (json_data, cache_file) => {
  return Promise.all(json_data.map((item, index) => getImage(item, index)))
    .then((result) => {
      // console.log(JSON.stringify(result, null, 2));
      fs.writeFileSync(cache_file, JSON.stringify(result, null, 2));
      console.log('Cached ' + cache_file);

      return result;
    });
}

module.exports = function() {

  fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + process.env.INSTAGRAM_TOKEN);
  // .then(res => res.json())
  // .then(json => console.log(json));

  return fetch('https://graph.instagram.com/me/media?fields=media_type,media_url,thumbnail_url,caption&access_token=' + process.env.INSTAGRAM_TOKEN)
    .then(res => res.json())
    .then(json => { 
      const cache_path = 'cache/';
      const cache_file = cache_path + 'instagram_cache.json';

      if(fs.existsSync(cache_file))
      {
        const contents = fs.readFileSync(cache_file, 'utf8');

        let cache_data = JSON.parse(contents);

        if(json && json.data && (json.data.length == cache_data.length))
        {
          let i;
          for(i = 0; i < json.data.length; ++i) {
            let json_media = json.data[i].thumbnail_url ? json.data[i].thumbnail_url : json.data[i].media_url;
            let cache_media = cache_data[i].source;

            json_media = json_media.split('?',1)[0];
            cache_media = cache_media.split('?',1)[0];

            if(json_media != cache_media) { cache_data = []; break; }
          }
        }

        if(cache_data.length) {
          console.log("Read Instagram cache.");
          return cache_data;
        }
      }

      if(!json) { return []; }

      fs.mkdirSync(cache_path, { recursive: true });
      fs.mkdirSync('dist/images/instagram/thumbs/', { recursive: true });

      return getImages(json.data, cache_file);
    });
};
