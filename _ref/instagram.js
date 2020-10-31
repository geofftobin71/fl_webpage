const fetch = require('node-fetch');

module.exports = function() {

  fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + process.env.INSTAGRAM_TOKEN);
  // .then(res => res.json())
  // .then(json => console.log(json));

  return fetch('https://graph.instagram.com/me/media?fields=media_url,caption&access_token=' + process.env.INSTAGRAM_TOKEN)
  .then(res => res.json())
  .then(json => { return json.data; });
  
};
