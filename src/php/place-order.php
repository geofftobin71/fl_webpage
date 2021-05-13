<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  echo '<pre>';
  echo '<br>POST<br>';
  print_r($_POST);
  echo '<br>';

  if(isset($_POST["payment-intent-id"])) { $payment_intent_id = clean($_POST["payment-intent-id"]); }
  if(isset($_POST["delivery-option"])) { $delivery_option = clean($_POST["delivery-option"]); }
  if(isset($_POST["delivery-name"])) { $delivery_name = clean($_POST["delivery-name"]); }
  if(isset($_POST["delivery-phone"])) { $delivery_phone = clean($_POST["delivery-phone"]); }
  if(isset($_POST["delivery-address"])) { $delivery_address = clean($_POST["delivery-address"]); }
  if(isset($_POST["delivery-suburb"])) { $delivery_suburb = clean($_POST["delivery-suburb"]); }
  if(isset($_POST["delivery-date"])) { $delivery_date = clean($_POST["delivery-date"]); }
  if(isset($_POST["gift-tag-message"])) { $gift_tag_message = clean($_POST["gift-tag-message"]); }
  if(isset($_POST["special-requests"])) { $special_requests = clean($_POST["special-requests"]); }
  if(isset($_POST["cardholder-name"])) { $cardholder_name = clean($_POST["cardholder-name"]); }
  if(isset($_POST["cardholder-email"])) { $cardholder_email = clean($_POST["cardholder-email"]); }
  if(isset($_POST["workshop-attendee-name"])) { $workshop_attendee_name = $_POST["workshop-attendee-name"]; }
  if(isset($_POST["workshop-attendee-email"])) { $workshop_attendee_email = $_POST["workshop-attendee-email"]; }
  if(isset($_POST["cart"])) { $cart = json_decode($_POST["cart"], true); }

  $order_date = new DateTime;
  $last_four = strval(rand(1111,9999));   // FIXME
  $delivery_fee = 0;
  if(isset($delivery_suburb) && (strtolower($delivery_suburb) !== "none")) { $delivery_fee = $delivery_fees[strtolower($delivery_suburb)]; }

  echo '<br>ORDER DATE<br>';
  print_r($order_date);
  echo $order_date->date;
  echo '<br>';

  echo '<br>CART<br>';
  print_r($cart);
  echo '<br>';

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

  echo '<br>PRODUCT NAMES<br>';
  print_r($product_names);
  echo '<br>';

  echo '<br>VARIANT NAMES<br>';
  print_r($variant_names);
  echo '<br>';

  $bookings = array();
  $order_items = array();
  $order_tickets = array();
  $total = $delivery_fee;

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $category = getCategory($product["category"]);
      $price = getPrice($product, $cart_item["variant-id"]);
      $total += $price;
      if(isset($category)) {
        if(strtolower($category["name"]) === "workshops") {
          $bookings[] = array(
            "workshop" => $product_names[$cart_id],
            "session" => $variant_names[$cart_id],
            "name" => $workshop_attendee_name[$cart_id],
            "email" => $workshop_attendee_email[$cart_id],
            "timestamp" => $order_date->format('Y-m-d H:i:s'),
            "price" => $price,
            "payment-id" => $payment_intent_id,
            "last-four" => $last_four,
            "cardholder-name" => $cardholder_name,
            "cardholder-email" => $cardholder_email,
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
    "delivery-name" => $delivery_name,
    "delivery-phone" => $delivery_phone,
    "delivery-address" => $delivery_address,
    "delivery-suburb" => $delivery_suburb,
    "delivery-date" => $delivery_date,
    "delivery-fee" => $delivery_fee,
    "gift-tag-message" => $gift_tag_message,
    "special-requests" => $special_requests,
    "timestamp" => $order_date->format('Y-m-d H:i:s'),
    "payment-id" => $payment_intent_id,
    "last-four" => $last_four,
    "cardholder-name" => $cardholder_name,
    "cardholder-email" => $cardholder_email,
    "items" => $order_items,
    "tickets" => $order_tickets,
    "total" => $total,
  );

  echo '<br>BOOKINGS<br>';
  print_r($bookings);
  echo '<br>';

  echo '<br>ORDER<br>';
  print_r($order);
  echo '<br>';

  /*
  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    if(isset($product)) {
      $category = getCategory($product["category"]);

      if(isset($category) && isset($category["delivery"]) && $category["delivery"]) { return true; }
    }
  }

  foreach($cart as $cart_item) {
    if(isset($cart_item["stock-id"])) {
      $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
      if($cart_item["updated"] == $stock_item["updated"]) {
        $stock_item["updated"] = microtime(true) - $cart_reset_time;
        $stockStore->update($stock_item);
      }
    }
  }
   */

/*
$orderStore->insert([
  "payment-id" => uniqueId(),
  "product-id" => $product["id"],
  "variant-id" => $variant["id"],
  "updated" => microtime(true) - $cart_reset_time,
  "sold" => false
]);
 */

}

?>
