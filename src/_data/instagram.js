const fetch = require('node-fetch');

module.exports = function() {

  return fetch('https://graph.instagram.com/me/media?fields=media_url,caption&access_token=IGQVJWSWZA2YkQ0NnBKODJOQ2tFYktweVl1c3ZArSUh4QnRnRE8xRjYzekd4YzgyOU8xUC1McktaRWswa0RxemxKMkdyMHU4emZAwVWtocmJtRVRZAbGI4bWpMdHFKUjN5Uml6MmR2ZATJtZAWdYMm1xQmt3ZAQZDZD')
  .then(res => res.json())
  .then(json => { return json.data; });
  
};