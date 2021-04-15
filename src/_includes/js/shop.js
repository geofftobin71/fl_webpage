luxon.Settings.defaultZoneName = "Pacific/Auckland";

var DateTime = luxon.DateTime;

var shop_products;
var shop_categories;
var delivery_fees;
var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];
var cart_total = 0;

const cart_expiry_time = 1800.0;  // 30 minutes
const cart_reset_time = 2100.0;   // 35 minutes

checkCartExpired();

async function displayProduct(product_id) {

  await fetchData();

  const product = getProduct(product_id);
  if(!product) { return }

  const category = getCategory(product["category"]);
  if(!category) { return }

  // -----

  let has_parents = false;

  if(category["parents"].length === 0) {
    has_parents = true
  } else {
    cart.forEach(cart_item => {
      const cart_product = getProduct(cart_item["product-id"]);
      if(cart_product) {
        if(category["parents"].includes(cart_product["category"])) { has_parents = true }
      }
    });
  }

  if(!has_parents) {
    document.getElementById("parents-in-cart").style.display = "none";
    document.getElementById("no-parents-in-cart").style.display = "block";
  }

  // -----

  if(hasStock(product)) {
    showProductStock(product_id);
  }

  // -----

  showViewCart();

  document.getElementById("add-to-cart-button").disabled = false;
}

async function fetchData() {
  let response;
  response = await fetch('/php/shop_products.json');
  shop_products = await response.json();

  response = await fetch('/php/shop_categories.json');
  shop_categories = await response.json();

  response = await fetch('/php/delivery_fees.json');
  delivery_fees = await response.json();
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

function hasStock(product) {
  let has_stock = false;

  if(product["stock"]) { has_stock = true; }

  product["variants"].forEach(variant => {
    if(variant["stock"]) { has_stock = true; }
  });

  return has_stock;
}

function showProductStock(product_id) {

  fetch("/php/stock-count.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "product-id": product_id
    })
  })
    .then(response => {
      if(!response.ok) {
        showError(response.statusText);
        throw Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then(json => {
      if(json.error) {
        showError(json.error);
        return;
      } else {
        if(json["stock-count"]) {
          let stock_count = json["stock-count"];

          for(const key in stock_count) {
            if(key === "total") {
              let total_stock_count = parseInt(stock_count["total"]);
              if(total_stock_count === 0) {
                document.getElementById("number-group").style.display = "none";
                document.getElementById("button-group").style.display = "none";
                document.getElementById("product-stock-count").innerText = "( SOLD OUT )";
                document.getElementById("product-stock-count").style.display = "block";
              }
            } else if(key === "none") { 
              let key_id = "product-stock-count";
              let value = stock_count[key];

              if(parseInt(value) > 0) {
                document.getElementById(key_id).innerText = "( " + value + " available )";
                document.getElementById(key_id).style.display = "block";
              }
            } else {
              let key_id = key + "-stock-count";
              let value = stock_count[key];

              if(parseInt(value) > 0) {
                document.getElementById(key_id).innerText = "( " + value + " available )";
                document.getElementById(key_id).style.display = "inline";
                document.getElementById(key_id).classList.add = "font-size--1";
                document.getElementById(key).disabled = false;
              } else {
                document.getElementById(key_id).innerText = "( SOLD OUT )";
                document.getElementById(key_id).style.display = "inline";
                document.getElementById(key).disabled = true;
              }
            }
          }
        }
      }
    });
}

function addToCart(product_id, is_finite, has_variants, variant_error) {

  const product_count = parseInt(document.getElementById('product-count').value) || 0;

  if(product_count < 1) {
    showError("Number must be 1 or more");
    return;
  }

  let variant_id = "none";
  if(has_variants) {
    let variant_input = document.querySelector('input[name="variant-id"]:checked');
    if(variant_input) {
      variant_id = variant_input.value;
    } else {
      showError(variant_error);
      return;
    }
  }

  if(is_finite) {

    fetch("/php/get-stock.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "product-id": product_id,
        "variant-id": variant_id,
        "product-count": product_count
      })
    })
      .then(response => {
        if(!response.ok) {
          showError(response.statusText);
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then(json => {
        if(json.error) {
          showError(json.error);
          return;
        } else {
          if(json.cart) {
            cart = cart.concat(json.cart);
            localStorage.setItem("floriade-cart", JSON.stringify(cart));
            localStorage.setItem("floriade-cart-info", product_count + (product_count === 1 ? " item was" : " items were") + " added to your cart");
            window.location.href = "/cart/";
          }
        }
      });
  } else {
    for(let i = 0; i < product_count; ++i) {
      cart.push({
        "cart-id": uniqueId(),
        "product-id": product_id,
        "variant-id": variant_id
      });
    }

    localStorage.setItem("floriade-cart", JSON.stringify(cart));
    localStorage.setItem("floriade-cart-info", product_count + (product_count === 1 ? " item was" : " items were") + " added to your cart");
    window.location.href = "/cart/";
  }
}

async function displayCart() {

  await fetchData();

  let info = localStorage.getItem("floriade-cart-info") || "";

  if(info !== "") {
    document.getElementById("info-msg").innerText = info;
    document.getElementById("info").style.display = "flex";
    localStorage.removeItem("floriade-cart-info");
  }

  checkCartExpired();

  if(localStorage.getItem("floriade-cart-expired")) {
    document.getElementById("cart-expired").style.display = "block";
    localStorage.removeItem("floriade-cart-expired");
  }

  if(cart.length === 0) {
    document.getElementById("empty-cart").style.display = "flex";
    return;
  }

	let delivery_suburb = localStorage.getItem("floriade-delivery-suburb");
	let cart_count = cart.length;
	let cart_items = "";
	let cart_summary = "";
	let delivery_fee = (delivery_suburb && delivery_suburb !== "none") ? delivery_fees[delivery_suburb] : 0;

	cart_total = 0;
	
	let i = 0;
	cart.forEach(cart_item => {

	  let product = getProduct(cart_item["product-id"]);
	  let price = getPrice(product, cart_item["variant-id"]);

	  cart_total += price;
	
	  cart_items += '<div class="stack" style="--stack-space:1em">';
	  cart_items += '<p>' + product["name"];
	
	  if(product["variants"].length) {
	    variant = getVariant(product, cart_item["variant-id"]);
	    cart_items += '<span class="font-size--1" style="white-space:nowrap"> ( ' + variant["name"] + ' )</span>';
	  }
	
    {% if env.NODE_ENV == 'develop' %}
	  if(cart_item["updated"]) {
	    cart_items += '<br><span class="font-size--1">' + DateTime.fromMillis((cart_item["updated"] + cart_expiry_time) * 1000.0).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) + '</span>';
	  }
    {% endif %}
	
	  cart_items += '</p>';
	
	  cart_items += '<div class="font-base font-size--1" style="display:flex;justify-content:flex-start">';
	  cart_items += '<div class="icon-button color-shade3" onclick="removeFromCart(' + i + ')">';
	  cart_items += '<span><svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg></span><p class="text-lowercase">Remove</p>';
	  cart_items += '</div>';
	  cart_items += '</div>';
	  cart_items += '</div>';
	  cart_items += '<p class="text-right">' + formatMoney(price) + '</p>';
	
	  i++;
	});
	
	cart_summary += '<h3 class="heading">Cart Total</h3>';
	cart_summary += '<p class="color-shade3">' + cart_count + (cart_count === 1 ? ' item' : ' items') + '</p>';
	cart_summary += '<p class="text-right">' + formatMoney(cart_total) + '</p>';
	
  let has_delivery = false;

  cart.forEach(cart_item => {
    const cart_product = getProduct(cart_item["product-id"]);
    if(cart_product) {
      const cart_category = getCategory(cart_product["category"]);
      if(cart_category) {
        if(cart_category["delivery"]) { has_delivery = true }
      }
    }
  });

  if(has_delivery) {
    cart_summary += '<h3 class="heading">Delivery To</h3>';
    cart_summary += '<select id="delivery-suburb" name="delivery-suburb" class="select-css" style="width:auto;margin-right:auto" onchange="updateDeliveryFee()">';
    cart_summary += '<option default disabled selected hidden value="">please choose...</option>';
    for(const suburb in delivery_fees) {
      cart_summary += '<option ' + (suburb === delivery_suburb ? 'selected ' : '') + 'value="' + suburb + '">' + titleCase(suburb) + '&nbsp;</option>';
    }
    cart_summary += '</select>';
    cart_summary += '<p id="delivery-fee" class="text-right">' + ((delivery_suburb && delivery_suburb !== "none") ? formatMoney(delivery_fee) : 'TBC') + '</p>';
  } else {
    cart_summary += '<input id="delivery-suburb" name="delivery-suburb" type="hidden" value="none"><p style="display:none"></p><p style="display:none"></p>';
    delivery_fee = 0;
  }

  cart_summary += '<h3 class="top-border font-size-1 text-lowercase">TOTAL</h3>';
  cart_summary += '<p class="top-border"></p>';
  cart_summary += '<p id="total" class="top-border font-size-1 text-right">' + formatMoney(delivery_fee + cart_total) + '</p>';

  document.getElementById("items").innerHTML = cart_items;
  document.getElementById("summary").innerHTML = cart_summary;
  document.getElementById("cart-form").style.display = "block";
  document.getElementById("checkout-button").disabled = false;
}

async function displayCheckout() {

  await fetchData();

  document.getElementById("checkout-form").addEventListener("submit", placeOrder);

  checkCartExpired();

  if(localStorage.getItem("floriade-cart-expired")) {
    document.getElementById("cart-expired").style.display = "block";
    localStorage.removeItem("floriade-cart-expired");
  }

  if(cart.length === 0) {
    document.getElementById("empty-cart").style.display = "flex";
    return;
  }

  let delivery_suburb = localStorage.getItem("floriade-delivery-suburb");

  if(!delivery_suburb) {
    window.location.href = "/cart/";
  }

	let cart_count = cart.length;
	let cart_items = "";
	let cart_summary = "";
	let delivery_fee = (delivery_suburb && delivery_suburb !== "none") ? delivery_fees[delivery_suburb] : 0;

	cart_total = 0;
	
	let i = 0;
	cart.forEach(cart_item => {
	  let product = getProduct(cart_item["product-id"]);
	  let price = getPrice(product, cart_item["variant-id"]);

	  cart_total += price;
	
	  cart_items += '<div class="stack" style="--stack-space:1em">';
	  cart_items += '<p>' + product["name"];
	
	  if(product["variants"].length) {
	    variant = getVariant(product, cart_item["variant-id"]);
	    cart_items += '<span class="font-size--1" style="white-space:nowrap"> ( ' + variant["name"] + ' )</span>';
	  }
	
	  cart_items += '</p>';
	
	  if(product["category"].toLowerCase() === "workshops") {
	    cart_items += '<div>';
	    cart_items += '<label for="ws-name-' + i + '"><h4 class="heading">Attendee Name</h4></label>';
	    cart_items += '<input class="input" style="width:100%" id="ws-name-' + i + '" name="workshop-attendee-name[' + cart_item['cart-id'] + ']" type="text" autocomplete="name" data-error="Attendee Name is required" onfocus="hideError()">';
	    cart_items += '<p class="caption text-left text-lowercase">Name of the person attending the workshop</p>';
	    cart_items += '</div>';
	    cart_items += '<div>';
	    cart_items += '<label for="ws-email-' + i + '"><h4 class="heading">Attendee Email</h4></label>';
	    cart_items += '<input class="input" style="width:100%" id="ws-email-' + i + '" name="workshop-attendee-email[' + cart_item['cart-id'] + ']" type="email" autocomplete="email" inputmode="email" data-error="Attendee Email is required" onfocus="hideError()">';
	    cart_items += '<p class="caption text-left text-lowercase">We will send a sign-up confirmation email to this address</p>';
	    cart_items += '</div>';
	  }
	
	  cart_items += '</div>';
	  cart_items += '<p class="text-right">' + formatMoney(price) + '</p>';
	
	  i++;
	});
	
	cart_summary += '<h3 class="heading">Cart Total</h3>';
	cart_summary += '<p class="color-shade3">' + cart_count + (cart_count === 1 ? ' item' : ' items') + '</p>';
	cart_summary += '<p class="text-right">' + formatMoney(cart_total) + '</p>';
	
  let has_delivery = false;

  cart.forEach(cart_item => {
    const cart_product = getProduct(cart_item["product-id"]);
    if(cart_product) {
      const cart_category = getCategory(cart_product["category"]);
      if(cart_category) {
        if(cart_category["delivery"]) { has_delivery = true }
      }
    }
  });

	if(has_delivery) {
	  cart_summary += '<h3 class="heading">';
	  if((delivery_suburb !== "none") && (delivery_suburb !== "pickup in store")) {
      cart_summary += 'Delivery to</h3>';
	    cart_summary += '<h3 class="heading"><span style="white-space:nowrap">' + titleCase(delivery_suburb) + '<span></h3>';
    }
	  if(delivery_suburb === "pickup in store") {
	    cart_summary += '<span style="white-space:nowrap">' + titleCase(delivery_suburb) + '<span></h3><p></p>';
    }
	  cart_summary += '<p id="delivery-fee" class="text-right">';
	  if(delivery_suburb !== "none") { cart_summary += formatMoney(delivery_fee); } else { cart_summary += "TBC"; } 
	  cart_summary += '</p>';
	} else {
    delivery_fee = 0;
  }
	
	cart_summary += '<h3 class="top-border font-size-1 text-lowercase">TOTAL</h3>';
	cart_summary += '<p class="top-border"></p>';
	cart_summary += '<p id="total" class="top-border font-size-1 text-right">' + formatMoney(delivery_fee + cart_total) + '</p>';

  if(has_delivery) {
    document.querySelectorAll(".delivery-group").forEach(element => {
      element.style.display = "block";
    });
  }

  const now = DateTime.now();
  const ten_am = DateTime.fromObject({hour:10});

  document.getElementById("delivery-suburb").value = titleCase(delivery_suburb);

  if((delivery_suburb !== "none") && (delivery_suburb !== "pickup in store")) {
    document.querySelectorAll(".delivery-address-group").forEach(element => {
      element.style.display = "block";
    });
  }

  document.getElementById("today").disabled = (now > ten_am);

  document.getElementById("items").innerHTML = cart_items;
  document.getElementById("summary").innerHTML = cart_summary;
  document.getElementById("checkout-form").style.display = "block";
  document.getElementById("place-order-button").disabled = false;
}

function checkCartExpired() {

  let expired = false;
  let timeout = microtime(true) - cart_expiry_time;

  cart.forEach(cart_item => {
    if((cart_item.updated) && (cart_item.updated < timeout)) {
      expired = true;
    }
  });

  if(expired) {

    fetch("/php/expire-cart.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "cart": cart
      })
    })
      .then(response => {
        if(!response.ok) {
          showError(response.statusText);
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then(json => {
        localStorage.setItem("floriade-cart-expired", true);
        localStorage.removeItem("floriade-cart");
        localStorage.removeItem("floriade-delivery-suburb");
        cart = [];
      });
  }
}

function removeFromCart(index) {

  fetch("/php/remove-from-cart.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "index": index,
      "cart": cart
    })
  })
    .then(response => {
      if(!response.ok) {
        showError(response.statusText);
        throw Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then(json => {
      if(json.error) {
        showError(json.error);
        return;
      } else {
        if(json.cart) {
          localStorage.setItem("floriade-cart", JSON.stringify(json.cart));
          localStorage.setItem("floriade-cart-info", json.count + (parseInt(json.count) === 1 ? " item was" : " items were") + " removed from your cart");
          if(json.cart.length === 0) {
            localStorage.removeItem("floriade-delivery-suburb");
          }
          window.location.href = "/cart/";
        }
      }
    });
}

function selectVariant(variant_id) {
  // Set variant max
  hideError();
}

function showSoldOut(product_price) {

  fetch("/php/stock-count.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "product-id": product_price.id
    })
  })
    .then(response => {
      if(!response.ok) {
        // showError(response.statusText);
        throw Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then(json => {
      if(json.error) {
        // showError(json.error);
        return;
      } else {
        if(json["stock-count"]) {
          let stock_count = json["stock-count"];

          for(const key in stock_count) {
            if(key === "total") {
              if(parseInt(stock_count["total"]) === 0) {
                product_price.innerHTML = "<p>SOLD OUT</p>";
              }
            }
          }
        }
      }
    });
}

function updateDeliveryFee() {
  let delivery_suburb = document.getElementById("delivery-suburb").value;
  localStorage.setItem("floriade-delivery-suburb", delivery_suburb);

  let delivery_fee = (delivery_suburb && delivery_suburb !== "none") ? delivery_fees[delivery_suburb] : 0;
  document.getElementById("delivery-fee").innerHTML = formatMoney(delivery_fee);
  document.getElementById("total").innerHTML = formatMoney(delivery_fee + cart_total);
}

function checkout() {
  const suburb = document.getElementById("delivery-suburb").value || "";

  if(suburb === "") {
    showError("Please choose a delivery option");
    return;
  }

  localStorage.setItem("floriade-delivery-suburb", suburb);

  window.location.href = "/checkout/";
}

function placeOrder(event) {
  event.preventDefault();

  disableCheckoutForm();

  const inputs = document.querySelectorAll("input,select");
  for(let i = 0; i < inputs.length; i++) {
    if(window.getComputedStyle(inputs[i]).display !== "none") {
      if(inputs[i].value.trim().length === 0) {
        showError(inputs[i].dataset.error || "ERROR");
        enableCheckoutForm();
        return false;
      }
    }
  };

  console.log("SUBMIT FORM");
}

function enableCheckoutForm() {
  document.getElementById("place-order-button").disabled = false;
  document.getElementById("spinner-icon").style.display = "none";
  document.getElementById("cart-icon").style.display = "inline-block";
}

function disableCheckoutForm() {
  document.getElementById("place-order-button").disabled = true;
  document.getElementById("spinner-icon").style.display = "inline-block";
  document.getElementById("cart-icon").style.display = "none";
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

function showViewCart() {
  if(cart.length > 0) {
    document.getElementById('view-cart').style.display = "flex";
  }
}

function microtime(get_as_float) {  
  let now = new Date().getTime() / 1000;  
  let s = parseInt(now);  
  return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;  
}

function uniqueId(len = 8) {
  const hex = '0123456789abcdef';
  let output = '';
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

function showError(message) {
  const error_msg = document.getElementById('error-msg');
  error_msg.innerText = message;
  error_msg.style.visibility = "visible";

  const info = document.getElementById("info");
  if(info) { info.style.display = "none"; }
}

function hideError() {
  document.getElementById('error-msg').style.visibility = "hidden";
}

function clearCart() {
  localStorage.removeItem("floriade-cart");
  localStorage.removeItem("floriade-delivery-suburb");
  window.location.href = "/cart/";
}

