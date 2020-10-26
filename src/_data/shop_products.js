const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

module.exports = function() {

  return stripe.products.list({
    limit: 100,
    active: true
  })
  .then(json => console.log(json.data));

};
