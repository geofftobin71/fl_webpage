var stripe;

async function displayCheckout() {

  await fetchData();

  checkCartExpired();

  if(localStorage.getItem("floriade-cart-expired")) {
    document.getElementById("cart-expired").style.display = "block";
    localStorage.removeItem("floriade-cart-expired");
  }

  if(cart.length === 0) {
    document.getElementById("empty-cart").style.display = "flex";
    return;
  }

  /*
  let delivery_suburb = localStorage.getItem("floriade-delivery-suburb");

  if(!delivery_suburb) {
    window.location.href = "/cart/";
  } else {
    delivery_suburb = delivery_suburb.toLowerCase();
  }
  */
  let delivery_suburb = "pickup in store";

  let cart_count = cart.length;
  let cart_items = "";
  let cart_summary = "";
  let delivery_fee = (delivery_suburb && delivery_suburb !== "none") ? delivery_fees[delivery_suburb] : 0;

  cart_total = 0;

  cart.forEach(cart_item => {
    let product = getProduct(cart_item["product-id"]);
    let price = getPrice(product, cart_item["variant-id"]);

    cart_total += price;

    cart_items += '<div class="vertical flow">';
    cart_items += '<p>' + product["name"];

    if(product["variants"].length) {
      variant = getVariant(product, cart_item["variant-id"]);
      cart_items += '<span class="font-size--1" style="white-space:nowrap"> ( ' + variant["name"] + ' )</span>';
    }

    cart_items += '</p>';

    if(product["category"].toLowerCase() === "workshops") {
      const cart_id = cart_item['cart-id'];

      cart_items += '<div>';
      cart_items += '<label for="workshop-name-' + cart_id + '"><h4 class="heading">Attendee Name</h4></label>';
      cart_items += '<input class="input workshop-name" id="workshop-name-' + cart_id + '" name="workshop-attendee-name[' + cart_id + ']" type="text" autocomplete="name" data-error="Attendee Name is required" onfocus="hideError()" onblur="cacheValue(this)">';
      cart_items += '<p class="caption text-left text-lowercase">Name of the person attending the workshop</p>';
      cart_items += '</div>';
      cart_items += '<div>';
      cart_items += '<label for="workshop-email-' + cart_id + '"><h4 class="heading">Attendee Email</h4></label>';
      cart_items += '<input class="input workshop-email" id="workshop-email-' + cart_id + '" name="workshop-attendee-email[' + cart_id + ']" type="email" autocomplete="email" inputmode="email" data-error="Attendee Email is required" onfocus="hideError()" onblur="cacheValue(this)">';
      cart_items += '<p class="caption text-left text-lowercase">We will send a sign-up confirmation email to this address</p>';
      cart_items += '</div>';
    }

    cart_items += '</div>';
    cart_items += '<p class="text-right">' + formatMoney(price) + '</p>';
  });

  cart_summary += '<h3 class="heading">Cart Total</h3>';
  cart_summary += '<p class="color-shade3" style="padding-left:2em">' + cart_count + (cart_count === 1 ? ' item' : ' items') + '</p>';
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

    if((delivery_suburb !== "none") && (delivery_suburb !== "pickup in store")) {
      document.querySelectorAll(".delivery-address-group").forEach(element => {
        element.style.display = "block";
      });
    }

    if(delivery_suburb === "pickup in store") {
      document.getElementById("delivery-date-label").innerText = "Pickup Date";
    }
  }

  const now = DateTime.now();
  const ten_am = DateTime.fromObject({hour:10});

  document.getElementById("today").disabled = (now > ten_am);

  document.getElementById("items").innerHTML = cart_items;
  document.getElementById("summary").innerHTML = cart_summary;
  document.getElementById("cart").value = JSON.stringify(cart);
  document.getElementById("checkout-form").style.display = "block";

  const inputs = document.querySelectorAll("input,select,textarea");
  for(let i = 0; i < inputs.length; i++) {
    let value = localStorage.getItem("floriade-" + inputs[i].id);
    if(value) { inputs[i].value = value; }
  };

  fetch("/php/create-payment-intent.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "cart": cart,
      "delivery-suburb": delivery_suburb
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
      return setupElements(json);
    })
    .then(({ stripe, card, clientSecret }) => {

      let form = document.getElementById("checkout-form");
      form.addEventListener("submit", function(event) {
        event.preventDefault();

        disableCheckoutForm();

        const inputs = document.querySelectorAll("input,select");
        for(let i = 0; i < inputs.length; i++) {
          if(window.getComputedStyle(inputs[i]).display !== "none") {
            if(inputs[i].value.trim().length === 0) {
              showError(inputs[i].dataset.error || "Credit Card Number is required");
              enableCheckoutForm();
              return false;
            }
          }
        };

        pay(stripe, card, clientSecret, form);
      },false);

      enableCheckoutForm();
    });

}

function enableCheckoutForm() {
  document.getElementById("place-order-button").disabled = false;
  document.getElementById("spinner-icon").style.display = "none";
  document.getElementById("cart-icon").style.display = "inline-block";
  document.getElementById("submit-text").innerText = "Order Now";
}

function disableCheckoutForm() {
  document.getElementById("place-order-button").disabled = true;
  document.getElementById("spinner-icon").style.display = "inline-block";
  document.getElementById("cart-icon").style.display = "none";
  document.getElementById("submit-text").innerText = "Submitting";
}

function cacheValue(e) {
  localStorage.setItem("floriade-" + e.id, e.value);
}

function setupElements(data) {
  stripe = Stripe(data.publishableKey);

  var elements = stripe.elements({fonts:[
    {
      family: "Poppins",
      weight: "normal",
      src: "url(https://floriade.co.nz/fonts/poppins-light-webfont.woff)",
      display: "swap"
    },
    {
      family: "Kollektif",
      weight: "normal",
      src: "url(https://floriade.co.nz/fonts/kollektif-webfont.woff)",
      display: "swap"
    }
  ]});

  var card = elements.create("card", {
    hidePostalCode: true,
    style: {
      base: {
        fontFamily: "Poppins, sans-serif",
        fontWeight: "normal",
        fontSize: "16px",
        lineHeight: "2em",
        color: "#333333",
        backgroundColor: "#CDDAD5",
        ":focus": {
          backgroundColor: "#CDDAD5",
        },
        ":-webkit-autofill": {
          color: "#333333",
          backgroundColor: "#CDDAD5",
        },
        "::placeholder": {
          fontFamily: "Kollektif, sans-serif",
          color: "#818D89",
        },
      },
    }
  });

  // FIXME card.mount("#card-input");

  card.addEventListener("change", function(event) {
    if(event.error) {
      showError(event.error.message);
    } else {
      hideError();
    }
  },false);

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret
  };
}

function pay(stripe, card, clientSecret, form) {
  disableCheckoutForm();

  // FIXME
  document.getElementById("payment-intent-id").value = 'pi_' + uniqueId(24);
  // localStorage.clear();
  form.submit();
  // FIXME

  /* FIXME
  stripe.confirmCardPayment(
    clientSecret, 
    { 
      payment_method: { 
        card: card,
        billing_details: {
          name: document.getElementById("cardholder-name").value,
          email: document.getElementById("cardholder-email").value
        }
      },
      receipt_email: document.getElementById("cardholder-email").value,
      shipping: {
        name: document.getElementById("delivery-name").value,
        phone: document.getElementById("delivery-phone").value,
        address: {
          line1: document.getElementById("delivery-address").value,
          line2: document.getElementById("delivery-suburb").value
        }
      }
    })
    .then(function(result) {
      enableCheckoutForm();
      if (result.error) {
        showError(result.error.message);
      } else {
        hideError();
        document.getElementById("payment-intent-id").value = result.paymentIntent.id;
        localStorage.clear();
        form.submit();
      }
    });
    */
}

