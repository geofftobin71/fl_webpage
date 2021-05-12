luxon.Settings.defaultZoneName = "Pacific/Auckland";

var DateTime = luxon.DateTime;

var shop_products;
var shop_categories;
var delivery_fees;
var flat_rate_delivery_fees;

async function fetchData() {
  let response;
  response = await fetch('/php/shop_products.json');
  shop_products = await response.json();

  response = await fetch('/php/shop_categories.json');
  shop_categories = await response.json();

  response = await fetch('/php/delivery_fees.json');
  delivery_fees = await response.json();

  response = await fetch('/php/flat_rate_delivery_fees.json');
  flat_rate_delivery_fees = await response.json();
}

function getProduct(product_id) {
  let result;

  shop_products.forEach(product => {
    if(product["id"] === product_id) { result = product; }
  });

  return result;
}

function getCategory(category_name) {
  let result;

  shop_categories.forEach(category => {
    if(category["name"] === category_name) { result = category; }
  });

  return result;
}

function getVariant(product, variant_id) {
  let result;

  if(product["variants"].length) {
    product["variants"].forEach(variant => {
      if(variant["id"] === variant_id) { result = variant; }
    });
  }

  return result;
}

function getPrice(product, variant_id) {
  let result;

  if(product["variants"].length) {
    product["variants"].forEach(variant => {
      if(variant["id"] === variant_id) {
        result = parseInt(variant["price"]) ? variant["price"] : product["price"];
      }
    });
  } else {
    result = product["price"];
  }

  return parseInt(result);
}

function formatMoney(price) {
  if(price === 0) { return 'free'; }
  if(Math.floor(price) === (price)) {
    return '$' + (price);
  } else {
    return '$' + (price).toFixed(2);
  }
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

function uniqueId(len = 8) {
  const hex = '0123456789abcdef';
  let output = '';
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

