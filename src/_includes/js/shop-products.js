async function displayShopProduct(product_id) {

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

function selectVariant(variant_id) {
  // Set variant max
  hideError();
}

function clearCart() {
  localStorage.clear();

  window.location.href = "/cart/";
}
