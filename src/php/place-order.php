<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  echo '<pre>';
  print_r($_POST);

  if(isset($_POST["payment-intent-id"])) { $payment_intent_id = clean($_POST["payment-intent-id"]); }
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

  echo '<br>';

  print_r($cart);
  echo '<br>';

  $product_names = array();
  $variant_names = array();
  $bookings = array();

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

  print_r($product_names);
  echo '<br>';

  print_r($variant_names);
  echo '<br>';

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $category = getCategory($product["category"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($category)) {
      if(strtolower($category["name"]) === "workshops") {
        $bookings[] = array(
          "workshop" => $product_names[$cart_id],
          "session" => $variant_names[$cart_id],
          "name" => $workshop_attendee_name[$cart_id],
          "email" => $workshop_attendee_email[$cart_id],
        );
      } else {
      }
    }
  }

  print_r($bookings);
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
