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
  if(delivery_suburb) { delivery_suburb = delivery_suburb.toLowerCase(); }
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

function updateDeliveryFee() {
  hideError();

  let delivery_suburb = document.getElementById("delivery-suburb").value;
  localStorage.setItem("floriade-delivery-suburb", titleCase(delivery_suburb));

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

  localStorage.setItem("floriade-delivery-suburb", titleCase(suburb));

  window.location.href = "/checkout/";
}
