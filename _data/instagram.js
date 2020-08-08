const fetch = require('node-fetch');

module.exports = function() {

  return fetch('https://graph.instagram.com/me/media?fields=media_url,caption&access_token=IGQVJWMlZANa0RmREZAKVWZAhLVg5UG9ZAVlhhYV9CRzlQNTZAwQ01tSVdSeVMydzVqbWtVQk5RbnpGQ3FpaWZAWRUtVM1lPbGtJT1M2N0YycWVlbjNZAUkZAIdUNvZATdRakJfUEhodU9McVR5V0diMG1MZA3hmeQZDZD')
  .then(res => res.json())
  .then(json => { return json.data; });
  
};