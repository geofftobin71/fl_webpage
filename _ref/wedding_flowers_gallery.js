var cloudinary = require('cloudinary').v2;

module.exports = function() {

  cloudinary.search
    .expression('folder:wedding-flowers')
    .sort_by('public_id','desc')
    .with_field('context')
    .max_results(500)
    .execute()
    .then(result=>console.log(JSON.stringify(result, null, 4)));

  // return fetch('https://graph.instagram.com/me/media?fields=media_url,caption&access_token=IGQVJWSWZA2YkQ0NnBKODJOQ2tFYktweVl1c3ZArSUh4QnRnRE8xRjYzekd4YzgyOU8xUC1McktaRWswa0RxemxKMkdyMHU4emZAwVWtocmJtRVRZAbGI4bWpMdHFKUjN5Uml6MmR2ZATJtZAWdYMm1xQmt3ZAQZDZD')
  // .then(res => res.json())
  // .then(json => { return json.data; });

};
