luxon.Settings.defaultZoneName = "Pacific/Auckland";

var DateTime = luxon.DateTime;

var shop_products;
var shop_categories;
var delivery_fees;
var flat_rate_delivery_fees;
var non_delivery_dates;
var shop_closed_dates;
var special_delivery_dates;
var special_shop_open_dates;
var shop_hours;

async function fetchData() {
  let response = await fetch('/php/shop-data.php');
  const shop_data = await response.json();

  shop_products = shop_data["shop-products"];
  shop_categories = shop_data["shop-categories"];
  delivery_fees = shop_data["delivery-fees"];
  flat_rate_delivery_fees = shop_data["flat-rate-delivery-fees"];
  non_delivery_dates = shop_data["non-delivery-dates"];
  shop_closed_dates = shop_data["shop-closed-dates"];
  special_delivery_dates = shop_data["special-delivery-dates"];
  special_shop_open_dates = shop_data["special-shop-open-dates"];
  shop_hours = shop_data["shop-hours"];
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
        result = parseFloat(variant["price"]) ? variant["price"] : product["price"];
      }
    });
  } else {
    result = product["price"];
  }

  return parseFloat(result);
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

