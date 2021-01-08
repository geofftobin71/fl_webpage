const fetch = require('node-fetch');
const fs = require('fs');
const sharp = require('sharp');

async function getImage(item, index) {
  let newItem = {};
  newItem.source = item.thumbnail_url ? item.thumbnail_url : item.media_url;
  newItem.caption = item.caption;

  const response = await fetch(newItem.source);
  const buffer = await response.buffer();
  const path = '/images/instagram/';
  const filename = 'floriade_wellington_' + ('0000' + (index + 1)).slice(-4) + '.jpg';

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
    .resize(32, 32)
    .blur(2)
    .toBuffer()
    .then((data) => {
      newItem.preview = "data:image/jpeg;base64," + data.toString('base64');
      console.log(JSON.stringify(newItem, null, 2));
      return newItem;
    });
};

const getImages = async (json_data) => {
  const cache_path = 'dist/cache/';
  const cache_file = cache_path + 'instagram_cache.json';

  if(fs.existsSync(cache_file))
  {
    fs.readFile(cache_file, 'utf8', (err, contents) => {
      if(err) throw err;

      var cache_data = JSON.parse(contents);

      var i;
      for(i = 0; i < json_data.length; ++i) {
        let json_media = json_data[i].thumbnail_url ? json_data[i].thumbnail_url : json_data[i].media_url;
        let cache_media = cache_data[i].source;

        if(json_media != cache_media) { cache_data = []; break; }
      }

      if(cache_data.length) { return cache_data; }
    });
  }

  fs.mkdirSync('dist/images/instagram/thumbs/', { recursive: true });

  return Promise.all(json_data.map((item, index) => getImage(item, index)))
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      fs.mkdirSync(cache_path, { recursive: true });
      fs.writeFileSync(cache_file, JSON.stringify(result, null, 2));
      console.log('Cached ' + cache_file);

      return result;
    });
}

module.exports = function() {

  fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + process.env.INSTAGRAM_TOKEN);
  // .then(res => res.json())
  // .then(json => console.log(json));

  return fetch('https://graph.instagram.com/me/media?fields=media_url,thumbnail_url,caption&access_token=' + process.env.INSTAGRAM_TOKEN)
    .then(res => res.json())
    .then(json => { return getImages(json.data); });
};
