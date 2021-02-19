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

  return true;
};

function validCategory(category) {

  if(category.disabled) { return false; }

  if(shop_products.length) {
    let valid_product = false;
  
    shop_products.forEach(product => {
      if(product.category == category.name) {
        if(validProduct(product)) {
          valid_product = true;
        }
      }
    });
  
    if(!valid_product) { return false; }
  }

  return true;
};

module.exports = function() {
  let filtered = [];

  shop_categories.forEach(category => {
    if(validCategory(category)) { filtered.push(category); }
  });

  return filtered;
};
