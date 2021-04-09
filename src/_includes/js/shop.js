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
          var stock_count = json["stock-count"];

          for(const key in stock_count) {
            if(key === "total") {
              var total_stock_count = parseInt(stock_count["total"]);
              if(total_stock_count === 0) {
                document.getElementById("number-group").style.display = "none";
                document.getElementById("button-group").style.display = "none";
                document.getElementById("product-stock-count").innerText = "( SOLD OUT )";
                document.getElementById("product-stock-count").style.display = "block";
              }
            } else if(key === "none") { 
              var key_id = "product-stock-count";
              var value = stock_count[key];

              if(parseInt(value) > 0) {
                document.getElementById(key_id).innerText = "( " + value + " available )";
                document.getElementById(key_id).style.display = "block";
              }
            } else {
              var key_id = key + "-stock-count";
              var value = stock_count[key];

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

function showViewCart() {
  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

  if(cart.length > 0) {
    document.getElementById('view-cart').style.display = "flex";
  }
}

function microtime(get_as_float) {  
  var now = new Date().getTime() / 1000;  
  var s = parseInt(now);  
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

function checkCartHasParents(product_id) {
  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

  fetch("/php/cart-has-parents.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "product-id": product_id,
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
        if(!json.result) {
          document.getElementById("parents-in-cart").style.display = "none";
          document.getElementById("no-parents-in-cart").style.display = "block";
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

  var variant_id = "none";
  if(has_variants) {
    var variant_input = document.querySelector('input[name="variant-id"]:checked');
    if(variant_input) {
      variant_id = variant_input.value;
    } else {
      showError(variant_error);
      return;
    }
  }

  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

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
            localStorage.setItem("floriade-cart-info", product_count + (product_count == 1 ? " item was" : " items were") + " added to your cart");
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
    localStorage.setItem("floriade-cart-info", product_count + (product_count == 1 ? " item was" : " items were") + " added to your cart");
    window.location.href = "/cart/";
  }
}

function removeFromCart(index) {
  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

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
          localStorage.setItem("floriade-cart-info", json.count + (parseInt(json.count) == 1 ? " item was" : " items were") + " removed from your cart");
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
          var stock_count = json["stock-count"];

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

function checkCartExpired(cart) {
  var expired = false;
  var timeout = microtime(true) - 300.0; // 1200.0;

  cart.forEach(item => {
    if((item.updated) && (item.updated < timeout)) {
      expired = true;
    }
  });

  if(expired) {
      // XXX Reset stock item timeouts
    document.getElementById("cart-expired").style.display = "block";
    localStorage.removeItem("floriade-cart");
    localStorage.removeItem("floriade-delivery-suburb");
    cart = [];
  }

  return cart;
}

function displayCart() {
  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

  cart = checkCartExpired(cart);

  if(cart.length === 0) {
    document.getElementById("empty-cart").style.display = "flex";
    return;
  }

  var info = localStorage.getItem("floriade-cart-info") || "";
  if(info !== "") {
    document.getElementById("info-msg").innerText = info;
    document.getElementById("info").style.display = "flex";
    localStorage.removeItem("floriade-cart-info");
  }

  fetch("/php/display-cart.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "cart": cart,
      "delivery-suburb": localStorage.getItem("floriade-delivery-suburb")
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
        document.getElementById("items").innerHTML = json["cart-items"];
        document.getElementById("summary").innerHTML = json["cart-summary"];
        cart_total = parseInt(json["cart-total"]);
      }
    });

  document.getElementById("cart-form").style.display = "block";
}

function displayCheckout() {
  var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];

  cart = checkCartExpired(cart);

  if(cart.length === 0) {
    document.getElementById("empty-cart").style.display = "flex";
    return;
  }

  fetch("/php/display-checkout.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "cart": cart,
      "delivery-suburb": localStorage.getItem("floriade-delivery-suburb")
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
        document.getElementById("items").innerHTML = json["cart-items"];
        document.getElementById("summary").innerHTML = json["cart-summary"];
      }
    });

  document.getElementById("checkout-form").style.display = "block";
}

function formatMoney(price) {
  if(price == 0) { return 'free'; }
  if(Math.floor(price) == (price)) {
    return '$' + (price);
  } else {
    return '$' + (price).toFixed(2);
  }
}

function updateDeliveryFee() {
  var suburb = document.getElementById("delivery-suburb").value;
  localStorage.setItem("floriade-delivery-suburb", suburb);

  fetch("/php/delivery-fee.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "delivery-suburb": suburb
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
        var delivery_fee = parseInt(json["delivery-fee"]);
        document.getElementById("delivery-fee").innerHTML = formatMoney(delivery_fee);
        document.getElementById("total").innerHTML = formatMoney(delivery_fee + cart_total);
      }
    });
}

function checkout() {
  const suburb = document.getElementById("delivery-suburb").value || "";

  if(suburb == "") {
    showError("Please choose a delivery option");
    return;
  }

  window.location.href = "/checkout/";
}

