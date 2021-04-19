var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];
var cart_total = 0;

const cart_expiry_time = 1800.0;  // 30 minutes
const cart_reset_time = 2100.0;   // 35 minutes

checkCartExpired();

function displayShop() {
  document.querySelectorAll(".product-price").forEach(product_price => {
    showSoldOut(product_price);
  });
  showViewCart();
}

function displayShopCategory() {
  displayShop();
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

function showError(message) {
  const error_msg = document.getElementById('error-msg');
  if(error_msg) {
    error_msg.innerText = message;
    error_msg.style.visibility = "visible";
  }

  const info = document.getElementById("info");
  if(info) { info.style.display = "none"; }
}

function hideError() {
  document.getElementById('error-msg').style.visibility = "hidden";
}
