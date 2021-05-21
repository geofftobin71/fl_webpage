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

	let cart_count = cart.length;
	let cart_items = "";
	let cart_summary = "";

  computeCartTotal();
	
	let i = 0;
	cart.forEach(cart_item => {

	  let product = getProduct(cart_item["product-id"]);
	  let price = getPrice(product, cart_item["variant-id"]);

	  cart_items += '<div class="vertical flow">';
	  cart_items += '<p>' + product["name"];
	
	  if(product["variants"].length) {
	    variant = getVariant(product, cart_item["variant-id"]);
	    cart_items += '<span class="font-size--1" style="white-space:nowrap"> ( ' + variant["name"] + ' )</span>';
	  }
	
    /* */
	  if(cart_item["updated"]) {
	    cart_items += '<br><span class="font-size--1">' + DateTime.fromMillis((cart_item["updated"] + cart_expiry_time) * 1000.0).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) + '</span>';
	  }
    /* */
	
	  cart_items += '</p>';
	
	  cart_items += '<div class="horizontal left font-base font-size--1 color-shade3" onclick="removeFromCart(' + i + ')">';
	  cart_items += '<svg class="button-icon" aria-hidden="true" focusable="false" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg><p class="text-lowercase">Remove</p>';
	  cart_items += '</div>';
	  cart_items += '</div>';
	  cart_items += '<p class="text-right">' + formatMoney(price) + '</p>';
	
	  i++;
	});
	
	cart_summary += '<h3 class="heading">Cart Total</h3>';
	cart_summary += '<p class="color-shade3" style="padding-left:2em">' + cart_count + (cart_count === 1 ? ' item' : ' items') + '</p>';
	cart_summary += '<p class="text-right">' + formatMoney(cart_total) + '</p>';
	
  document.getElementById("items").innerHTML = cart_items;
  document.getElementById("summary").innerHTML = cart_summary;
  document.getElementById("cart-form").style.display = "block";

  if(!cartHasDelivery()) {
    document.getElementById("delivery-message").style.display = "none";
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
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      if(json.error) {
        throw Error(json.error);
      }
      if(json.cart) {
        if(json.cart.length === 0) {
          localStorage.clear();
        }
        localStorage.setItem("floriade-cart", JSON.stringify(json.cart));
        localStorage.setItem("floriade-cart-info", json.count + (parseInt(json.count) === 1 ? " item was" : " items were") + " removed from your cart");
        window.location.href = "/cart/";
      }
    })
    .catch(error => {
      showError(error.message);
    });
}

