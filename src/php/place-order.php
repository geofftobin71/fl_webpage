<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

if($_SERVER["REQUEST_METHOD"] === "POST") {

  if(isset($_POST["payment-intent-id"])) { $payment_intent_id = clean($_POST["payment-intent-id"]); }
  if(isset($_POST["card-brand"])) { $card_brand = clean($_POST["card-brand"]); }
  if(isset($_POST["card-month"])) { $card_month = clean($_POST["card-month"]); }
  if(isset($_POST["card-year"])) { $card_year = clean($_POST["card-year"]); }
  if(isset($_POST["card-last4"])) { $card_last4 = clean($_POST["card-last4"]); }
  if(isset($_POST["delivery-option"])) { $delivery_option = clean($_POST["delivery-option"]); }
  if(isset($_POST["delivery-name"])) { $delivery_name = clean($_POST["delivery-name"]); }
  if(isset($_POST["delivery-phone"])) { $delivery_phone = clean($_POST["delivery-phone"]); }
  if(isset($_POST["delivery-address"])) { $delivery_address = clean($_POST["delivery-address"]); }
  if(isset($_POST["delivery-suburb"])) { $delivery_suburb = clean($_POST["delivery-suburb"]); } else { $delivery_suburb = ""; }
  if(isset($_POST["delivery-date"])) { $delivery_date = clean($_POST["delivery-date"]); } else { $delivery_date = ""; }
  if(isset($_POST["gift-tag-message"])) { $gift_tag_message = clean($_POST["gift-tag-message"]); }
  if(isset($_POST["special-requests"])) { $special_requests = clean($_POST["special-requests"]); }
  if(isset($_POST["cardholder-name"])) { $cardholder_name = clean($_POST["cardholder-name"]); }
  if(isset($_POST["cardholder-email"])) { $cardholder_email = clean($_POST["cardholder-email"]); }
  if(isset($_POST["cardholder-phone"])) { $cardholder_phone = clean($_POST["cardholder-phone"]); }
  if(isset($_POST["workshop-attendee-name"])) { $workshop_attendee_name = $_POST["workshop-attendee-name"]; }
  if(isset($_POST["workshop-attendee-email"])) { $workshop_attendee_email = $_POST["workshop-attendee-email"]; }
  if(isset($_POST["cart"])) { $cart = json_decode($_POST["cart"], true); }
  if(isset($_POST["cart-total-check"])) { $cart_total = intVal(clean($_POST["cart-total-check"])); }
  if(isset($_POST["delivery-total-check"])) { $delivery_fee = intVal(clean($_POST["delivery-total-check"])); }

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
      }
    }
  }

  $bookings = array();
  $order_items = array();
  $order_tickets = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $category = getCategory($product["category"]);
      $price = getPrice($product, $cart_item["variant-id"]);
      if(isset($category)) {
        if(strtolower($category["name"]) === "workshops") {
          $bookings[] = array(
            "payment-id" => $payment_intent_id,
            "timestamp" => $order_date->format('Y-m-d H:i:s'),
            "workshop" => $product_names[$cart_id],
            "session" => $variant_names[$cart_id],
            "name" => $workshop_attendee_name[$cart_id],
            "email" => $workshop_attendee_email[$cart_id],
            "price" => $price,
            "cardholder-name" => $cardholder_name,
            "cardholder-email" => $cardholder_email,
            "cardholder-phone" => $cardholder_phone,
            "card-brand" => $card_brand,
            "card-month" => $card_month,
            "card-year" => $card_year,
            "card-last4" => $card_last4,
          );

          $order_tickets[] = array(
            "workshop" => $product_names[$cart_id],
            "session" => $variant_names[$cart_id],
            "price" => $price,
            "name" => $workshop_attendee_name[$cart_id],
            "email" => $workshop_attendee_email[$cart_id],
          );
        } else {
          $order_items[] = array(
            "product" => $product_names[$cart_id],
            "variant" => $variant_names[$cart_id],
            "price" => $price,
          );
        }
      }
    }
  }

  $order = array(
    "payment-id" => $payment_intent_id,
    "timestamp" => $order_date->format('Y-m-d H:i:s'),
    "delivery-option" => ucwords($delivery_option),
    "delivery-name" => $delivery_name,
    "delivery-phone" => $delivery_phone,
    "delivery-address" => $delivery_address,
    "delivery-suburb" => ucwords($delivery_suburb),
    "delivery-date" => $delivery_date,
    "gift-tag-message" => $gift_tag_message,
    "special-requests" => $special_requests,
    "cardholder-name" => $cardholder_name,
    "cardholder-email" => $cardholder_email,
    "cardholder-phone" => $cardholder_phone,
    "card-brand" => $card_brand,
    "card-month" => $card_month,
    "card-year" => $card_year,
    "card-last4" => $card_last4,
    "items" => $order_items,
    "tickets" => $order_tickets,
    "cart-total" => $cart_total,
    "delivery-fee" => $delivery_fee,
    "total" => $cart_total + $delivery_fee,
  );

  foreach($cart as $cart_item) {
    if(isset($cart_item["stock-id"])) {
      $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
      if($cart_item["updated"] == $stock_item["updated"]) {
        $stock_item["sold"] = true;
        $stockStore->update($stock_item);
      }
    }
  }

  $orderStore->insert($order);

  foreach($bookings as $booking) {
    $workshopStore->insert($booking);
  }

  /* DEBUG

  echo '<pre>';
  echo '<br>POST<br>';
  print_r($_POST);
  echo '<br>';

  echo '<br>ORDER DATE<br>';
  print_r($order_date);
  echo $order_date->date;
  echo '<br>';

  echo '<br>CART<br>';
  print_r($cart);
  echo '<br>';

  echo '<br>PRODUCT NAMES<br>';
  print_r($product_names);
  echo '<br>';

  echo '<br>VARIANT NAMES<br>';
  print_r($variant_names);
  echo '<br>';

  echo '<br>BOOKINGS<br>';
  print_r($bookings);
  echo '<br>';

  echo '<br>ORDER<br>';
  print_r($order);
  echo '<br>';

  */

}

?>
