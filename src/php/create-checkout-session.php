<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

const date_format = "g:ia l j F Y";

if($_SERVER["REQUEST_METHOD"] === "POST") {

  $delivery_option = "none";
  $delivery_name = "Floriade";
  $delivery_phone = null;
  $delivery_address = "18 Cambridge Terrace";
  $delivery_suburb = "Te Aro";
  $delivery_date = null;
  $gift_tag_message = null;
  $special_requests = null;
  $cardholder_name = null;
  $cardholder_email = null;
  $cardholder_phone = null;
  $workshop_attendee_name = array();
  $workshop_attendee_email = array();
  $cart = array();
  $cart_total = 0.0;
  $delivery_fee = 0.0;

  if(!empty($_POST["delivery-option"])) { $delivery_option = clean($_POST["delivery-option"]); }
  if(!empty($_POST["delivery-name"])) { $delivery_name = clean($_POST["delivery-name"]); }
  if(!empty($_POST["delivery-phone"])) { $delivery_phone = clean($_POST["delivery-phone"]); }
  if(!empty($_POST["delivery-address"])) { $delivery_address = clean($_POST["delivery-address"]); }
  if(!empty($_POST["delivery-suburb"])) { $delivery_suburb = clean($_POST["delivery-suburb"]); }
  if(!empty($_POST["delivery-date"])) { $delivery_date = clean($_POST["delivery-date"]); }
  if(!empty($_POST["gift-tag-message"])) { $gift_tag_message = clean($_POST["gift-tag-message"]); }
  if(!empty($_POST["special-requests"])) { $special_requests = clean($_POST["special-requests"]); }
  if(!empty($_POST["cardholder-name"])) { $cardholder_name = clean($_POST["cardholder-name"]); }
  if(!empty($_POST["cardholder-email"])) { $cardholder_email = clean($_POST["cardholder-email"]); }
  if(!empty($_POST["cardholder-phone"])) { $cardholder_phone = clean($_POST["cardholder-phone"]); }
  if(!empty($_POST["workshop-attendee-name"])) { $workshop_attendee_name = $_POST["workshop-attendee-name"]; }
  if(!empty($_POST["workshop-attendee-email"])) { $workshop_attendee_email = $_POST["workshop-attendee-email"]; }
  if(!empty($_POST["cart"])) { $cart = json_decode($_POST["cart"], true); }
  if(!empty($_POST["cart-total-check"])) { $cart_total = floatVal(clean($_POST["cart-total-check"])); }
  if(!empty($_POST["delivery-total-check"])) { $delivery_fee = floatVal(clean($_POST["delivery-total-check"])); }

  if(empty($cardholder_name)) { header("Location:/shop-error/?p=" . obfencode("Error: Missing cardholder name")); exit; }
  if(empty($cardholder_phone)) { header("Location:/shop-error/?p=" . obfencode("Error: Missing cardholder phone")); exit; }
  if(empty($cardholder_email)) { header("Location:/shop-error/?p=" . obfencode("Error: Missing cardholder email")); exit; }
  if(empty($cart)) { header("Location:/shop-error/?p=" . obfencode("Error: Missing cart")); exit; }
  if($cart_total < 1) { header("Location:/shop-error/?p=" . obfencode("Error: Zero cart total")); exit; }

  $order_date = new DateTime;

  $product_names = array();
  $variant_names = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $product_names[$cart_id] = $product["name"];
      $variant = getVariant($product, $cart_item["variant-id"]);
      if(isset($variant)) {
        $variant_names[$cart_id] = $variant["name"];
      } else {
        $variant_names[$cart_id] = "";
      }
    }
  }

  $line_items = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $category = getCategory($product["category"]);
      $price = getPrice($product, $cart_item["variant-id"]);
      if(isset($category)) {
        $item_metadata = array();
        $item_metadata["category"] = $category["name"];
        if(isset($workshop_attendee_name[$cart_id])) {
          $item_metadata["workshop_attendee_name"] = $workshop_attendee_name[$cart_id];
        }
        if(isset($workshop_attendee_email[$cart_id])) {
          $item_metadata["workshop_attendee_email"] = $workshop_attendee_email[$cart_id];
        }
        $line_item = [
          "price_data" => [
            "product_data" => [
              "name" => $product_names[$cart_id],
              "metadata" => $item_metadata,
            ],
            "unit_amount" => intVal($price * 100.0),
            "currency" => "nzd",
          ],
          "quantity" => 1,
        ];

        if(!empty($variant_names[$cart_id])) {
          $line_item["price_data"]["product_data"]["description"] = $variant_names[$cart_id];
        }

        $line_items[] = $line_item;
      }
    }
  }

  $shipping_rates = array();

  if($delivery_option === "pickup") {
    $shipping_rates[0] = $delivery_ids["pickup in store"];
  }

  if($delivery_option === "delivery") {
    $shipping_rates[0] = $delivery_ids[strtolower($delivery_suburb)];

    // Flat rate $20 on Saturday
    if(str_starts_with($delivery_date, 'Sat')) {
      if($delivery_fee < 20) {
        $shipping_rates[0] = "shr_1JDNodLjelSQaoWrU2Oej6rd";
      }
    }

    // Flat rate delivery fee on special dates
    foreach($flat_rate_delivery_ids as $date => $value) {
      if(str_ends_with($delivery_date, $date)) {
        $shipping_rates[0] = $value;
      }
    }
  }

  $shipping = [
    "name" => $delivery_name,
    "phone" => $delivery_phone,
    "address" => [
      "line1" => $delivery_address,
      "line2" => ucwords($delivery_suburb),
      "city" => "Wellington",
      "country" => "NZ"
    ]
  ];

  $metadata = [
    "timestamp" => $order_date->format(date_format),
    "delivery-option" => $delivery_option,
    "delivery-name" => $delivery_name,
    "delivery-phone" => $delivery_phone,
    "delivery-address" => $delivery_address,
    "delivery-suburb" => ucwords($delivery_suburb),
    "delivery-date" => $delivery_date,
    "gift-tag-message" => truncateEllipses($gift_tag_message, 500),
    "special-requests" => truncateEllipses($special_requests, 500),
    "cardholder-name" => $cardholder_name,
    "cardholder-email" => $cardholder_email,
    "cardholder-phone" => $cardholder_phone,
  ];

  $index = 1;
  foreach($workshop_attendee_name as $name) {
    $metadata["workshop-attendee-name-" . $index] = $name;
    $index++;
  }

  $index = 1;
  foreach($workshop_attendee_email as $email) {
    $metadata["workshop-attendee-email-" . $index] = $email;
    $index++;
  }

  header("Content-Type: application/json");

  $YOUR_DOMAIN = "http://168.138.10.72";

  $checkout_session = $stripe->checkout->sessions->create([
    "success_url" => $YOUR_DOMAIN . "/checkout-success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url" => $YOUR_DOMAIN . "/checkout/",
    "mode" => "payment",
    "payment_method_types" => ["card"],
    "customer_email" => $cardholder_email,
    "line_items" => $line_items,
    "shipping_rates" => $shipping_rates,
    "metadata" => $metadata,
    "payment_intent_data" => [
      "receipt_email" => $cardholder_email,
      "shipping" => $shipping,
    ],
  ]);

  header("HTTP/1.1 303 See Other");
  header("Location: " . $checkout_session->url);
}
?>
