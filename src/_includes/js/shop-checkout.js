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

  let delivery_date_select = document.getElementById("delivery-date");

  let day = DateTime.now();
  for(let i = 0; i < 14; ++i) {
    let text = day.toFormat("EEE dd MMM yyyy");
    let value = day.toFormat("EEEE dd MMMM yyyy");
    let option = new Option(text, value);
    option.className = "delivery-date-option";
    if(i == 0) {
      option.id = "today";
      option.text += " (today)";
    }
    delivery_date_select.options[delivery_date_select.options.length] = option;

    day = day.plus({days:1});
  }

  let delivery_option = localStorage.getItem("floriade-delivery-option") || "none";

  if(delivery_option !== "none") {
    document.getElementById("delivery-option-" + delivery_option).checked = true;
    selectDeliveryOption(delivery_option);
  }

  let cart_count = cart.length;
  let cart_items = "";

  computeCartTotal();

  cart.forEach(cart_item => {
    let product = getProduct(cart_item["product-id"]);
    let price = getPrice(product, cart_item["variant-id"]);

    cart_items += '<div class="vertical flow">';
    cart_items += '<p>' + product["name"];

    if(product["variants"].length) {
      variant = getVariant(product, cart_item["variant-id"]);
      cart_items += '<span class="font-size--1" style="white-space:nowrap"> ( ' + variant["name"] + ' )</span>';
    }

    /*
	  if(cart_item["updated"]) {
	    cart_items += '<br><span class="font-size--1">' + DateTime.fromMillis((cart_item["updated"] + cart_expiry_time) * 1000.0).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) + '</span>';
	  }
    */
	
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

  document.getElementById("cart-count").innerText = cart_count + (cart_count === 1 ? ' item' : ' items');
  document.getElementById("cart-total").innerText = formatMoney(cart_total);
  document.getElementById("cart-total-check").value = cart_total;

  if(cartHasDelivery()) {
    document.querySelectorAll(".delivery-group").forEach(element => {
      element.style.display = "block";
    });
  
    if(delivery_option !== "pickup") {
      document.getElementById("delivery-option-delivery").checked = true;
      selectDeliveryOption("delivery");
    }
  }

  document.getElementById("items").innerHTML = cart_items;
  document.getElementById("cart").value = JSON.stringify(cart);
  document.getElementById("checkout-form").style.display = "block";

  const inputs = document.querySelectorAll("input,select,textarea");
  for(let i = 0; i < inputs.length; i++) {
    let value = localStorage.getItem("floriade-" + inputs[i].id);
    if(value) { inputs[i].value = value; }
  };

  disableInvalidDates(delivery_option);
  updateTotal();

  {% if env.NODE_ENV == 'develop' %}
  var stripe = Stripe("{{ env.STRIPE_TEST_PUBLIC_KEY }}");
  {% else %}
  var stripe = Stripe("{{ env.STRIPE_LIVE_PUBLIC_KEY }}");
  {% endif %}

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

  var form = document.getElementById("checkout-form");

  form.addEventListener("submit", async function(event) {
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

    await checkCartExpired();

    if(localStorage.getItem("floriade-cart-expired")) {
      document.getElementById("cart-expired").style.display = "block";
      localStorage.removeItem("floriade-cart-expired");
    }

    if(cart.length === 0) {
      document.getElementById("empty-cart").style.display = "flex";
      document.getElementById("checkout-form").style.display = "none";
      return false;
    }

    const delivery_option = document.querySelector('input[name="delivery-option"]:checked').value;
    const delivery_name = document.getElementById("delivery-name").value;
    const delivery_phone = document.getElementById("delivery-phone").value;
    const delivery_address = document.getElementById("delivery-address").value;
    const delivery_suburb = document.getElementById("delivery-suburb").value;
    const delivery_date = document.getElementById("delivery-date").value;
    const cart_total_check = document.getElementById("cart-total-check").value;
    const delivery_total_check = document.getElementById("delivery-total-check").value;
    const gift_tag_message = document.getElementById("gift-tag-message").value;
    const special_requests = document.getElementById("special-requests").value;
    const cardholder_name = document.getElementById("cardholder-name").value;
    const cardholder_email = document.getElementById("cardholder-email").value;
    const cardholder_phone = document.getElementById("cardholder-phone").value;
    const workshop_attendee_name = [...document.querySelectorAll(".workshop-name")].map(s => s.value);
    const workshop_attendee_email = [...document.querySelectorAll(".workshop-email")].map(s => s.value);

    fetch("/php/create-payment-intent.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "cart": cart,
        "cart-total-check": cart_total_check,
        "delivery-total-check": delivery_total_check,
        "delivery-option": delivery_option,
        "delivery-name": delivery_name,
        "delivery-phone": delivery_phone,
        "delivery-address": delivery_address,
        "delivery-suburb": delivery_suburb,
        "delivery-date": delivery_date,
        "gift-tag-message": gift_tag_message,
        "special-requests": special_requests,
        "cardholder-name": cardholder_name,
        "cardholder-email": cardholder_email,
        "cardholder-phone": cardholder_phone,
        "workshop-attendee-name": workshop_attendee_name,
        "workshop-attendee-email": workshop_attendee_email
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
        pay(stripe, card, json.clientSecret, form);
      })
      .catch(error => {
        showError(error.message);
      });
  },false);

  enableCheckoutForm();
}

function disableInvalidDates(delivery_option) {
  document.querySelectorAll(".delivery-date-option").forEach(element => {
    element.disabled = false;
    if(delivery_option === "delivery") {
      non_delivery_dates.forEach(date => {
        if(element.value.endsWith(date)) {
          element.disabled = true;
        }
      });

      for(let dayName in shop_hours) {
        if(shop_hours[dayName].toLowerCase().startsWith("closed")) {
          if(element.value.toLowerCase().startsWith(dayName.substr(0,3).toLowerCase())) {
            element.disabled = true;
          }
        }
      }

      special_delivery_dates.forEach(date => {
        if(element.value.endsWith(date)) {
          element.disabled = false;
        }
      });
    }

    if(delivery_option === "pickup") {
      shop_closed_dates.forEach(date => {
        if(element.value.endsWith(date)) {
          element.disabled = true;
        }
      });

      for(let dayName in shop_hours) {
        if(shop_hours[dayName].toLowerCase().startsWith("closed")) {
          if(element.value.toLowerCase().startsWith(dayName.substr(0,3).toLowerCase())) {
            element.disabled = true;
          }
        }
      }

      special_shop_open_dates.forEach(date => {
        if(element.value.endsWith(date)) {
          element.disabled = false;
        }
      });
    }
  });

  const now = DateTime.now();
  const ten_am = DateTime.fromObject({hour:10});

  let today = document.getElementById("today");
  if(today) {
    today.disabled = (now > ten_am);
  }

  var delivery_date = document.getElementById("delivery-date");
  var opt = delivery_date.options[delivery_date.selectedIndex];
  if(opt.disabled) {
    opt.selected = false;
    delivery_date.options[0].selected = true;
  }
}

function selectDeliveryOption(delivery_option) {
  localStorage.setItem("floriade-delivery-option", delivery_option);

  if(delivery_option === "pickup") {
    document.getElementById("delivery-date-label").innerText = "Pickup Date";
    document.getElementById("delivery-date-caption").innerText = "Orders must be received by 10am for same day pickup";
    document.getElementById("delivery-date").setAttribute("data-error","Pickup Date is required");
    document.querySelectorAll(".delivery-address-group").forEach(element => {
      element.style.display = "none";
    });
    document.getElementById("delivery-address").value = "";
    document.getElementById("delivery-suburb").options[0].selected = true;
    localStorage.removeItem("floriade-delivery-address");
    localStorage.removeItem("floriade-delivery-suburb");
  }

  if(delivery_option === "delivery") {
    document.getElementById("delivery-date-label").innerText = "Delivery Date";
    document.getElementById("delivery-date-caption").innerText = "Orders must be received by 10am for same day delivery";
    document.getElementById("delivery-date").setAttribute("data-error","Delivery Date is required");
    document.querySelectorAll(".delivery-address-group").forEach(element => {
      element.style.display = "block";
    });
  }

  disableInvalidDates(delivery_option);
  updateTotal();
}

function updateTotal() {
  const delivery_suburb = document.getElementById("delivery-suburb").value;
  const delivery_date = document.getElementById("delivery-date").value;
  const delivery_option = document.querySelector('input[name="delivery-option"]:checked').value;

  document.getElementById("delivery-total-check").value = 0;

  if(delivery_option === "none") {
    document.getElementById("total").innerText = formatMoney(cart_total);
  } else if(delivery_option === "pickup") {
    document.getElementById("delivery-heading").innerText = "Pickup in Store";
    document.getElementById("delivery-suburb-name").innerText = "";
    document.getElementById("delivery-total").innerText = "free";
    document.getElementById("total").innerText = formatMoney(cart_total);
  } else {
    if(delivery_suburb && delivery_date) {
      let delivery_fee = delivery_fees[delivery_suburb];

      if(delivery_date.startsWith("Sat")) {
        delivery_fee = (delivery_fee < 20) ? 20 : delivery_fee;
      }

      for(let date in flat_rate_delivery_fees) {
        if(delivery_date.endsWith(date)) {
          let fee = parseInt(flat_rate_delivery_fees[date]);
          if(fee === 0) {
            delivery_fee = fee;
          } else {
            delivery_fee = (delivery_fee < fee) ? fee : delivery_fee;
          }
        }
      }

      document.getElementById("delivery-heading").innerText = "Delivery to";
      document.getElementById("delivery-suburb-name").innerText = delivery_suburb;
      document.getElementById("delivery-total").innerText = formatMoney(delivery_fee);
      document.getElementById("total").innerText = formatMoney(cart_total + delivery_fee);

      document.getElementById("delivery-total-check").value = delivery_fee;
    } else {
      document.getElementById("delivery-heading").innerText = "Delivery";
      document.getElementById("delivery-suburb-name").innerText = "";
      document.getElementById("delivery-total").innerText = "TBC";
      document.getElementById("total").innerText = "TBC"
    }
  }
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

function pay(stripe, card, clientSecret, form) {
  disableCheckoutForm();

  // FIXME
  document.getElementById("payment-intent-id").value = 'pi_' + uniqueId(24);
  document.getElementById("card-brand").value = 'Visa';
  document.getElementById("card-month").value = '09';
  document.getElementById("card-year").value = '2022';
  document.getElementById("card-last4").value = '4242';
  localStorage.clear();
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
          email: document.getElementById("cardholder-email").value,
          phone: document.getElementById("cardholder-phone").value
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
        document.getElementById("card-brand").value = result.paymentIntent.charges.data[0].payment_method_details.card.brand;
        document.getElementById("card-month").value = result.paymentIntent.charges.data[0].payment_method_details.card.exp_month;
        document.getElementById("card-year").value = result.paymentIntent.charges.data[0].payment_method_details.card.exp_year;
        document.getElementById("card-last4").value = result.paymentIntent.charges.data[0].payment_method_details.card.last4;
        localStorage.clear();
        form.submit();
      }
    });
    */
}

