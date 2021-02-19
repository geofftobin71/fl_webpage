const shop_categories = require('./shop_categories.json');
const shop_products = require('./shop_products.json');

function validProduct(product) {

  if(product.disabled) { return false; }

  if(product.variants.length) {
    let valid_variant = false;
  
    product.variants.forEach(variant => {
      if(!variant.disabled) {
        valid_variant = true;
      }
    });
  
    if(!valid_variant) { return false; }
  }

  let valid_category = false;

  shop_categories.forEach(category => {
    if(product.category == category.name) {
      if(!category.disabled) { valid_category = true; }
    }
  });

  if(!valid_category) { return false; }

  return true;
};

module.exports = function() {
  let filtered = [];

  shop_products.forEach(product => {
    if(validProduct(product)) { filtered.push(product); }
  });

  return filtered;
};
