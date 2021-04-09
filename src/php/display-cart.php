<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid request']);
  exit;
}

$cart = $body["cart"];
$delivery_suburb = $body["delivery-suburb"];
$cart_count = count($cart);
$cart_items = "";
$cart_summary = "";
$cart_total = 0;
$delivery_fee = ($delivery_suburb && $delivery_suburb != "none") ? $delivery_fees[$delivery_suburb] : 0;

$i = 0;
foreach($cart as $cart_item) {
  $product = getProduct($cart_item["product-id"]);
  $price = getPrice($product, $cart_item["variant-id"]);
  $cart_total += $price;

  $cart_items .= '<div class="stack" style="--stack-space:1em">';
  $cart_items .= '<p>' . $product["name"];

  if(hasVariants($product)) {
    $variant = getVariant($product, $cart_item["variant-id"]);
    $cart_items .= '<span class="font-size--1" style="white-space:nowrap"> ( ' . $variant["name"] . ' )</span>';
  }

  /*
  if(isset($cart_item["updated"])) {
    $cart_items .= '<br><span class="font-size--1">' . (DateTime::createFromFormat("U", floor(floatVal($cart_item["updated"]) + floatVal($cart_expiry_time)))->setTimeZone(new DateTimeZone("Pacific/Auckland"))->format(DateTimeInterface::W3C)) . '</span>';
  }
  */

  $cart_items .= '</p>';

  $cart_items .= '<div class="font-base font-size--1" style="display:flex;justify-content:flex-start">';
  $cart_items .= '<div class="icon-button color-shade3" onclick="removeFromCart(' . $i . ')">';
  $cart_items .= '<span><svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg></span><p class="text-lowercase">Remove</p>';
  $cart_items .= '</div>';
  $cart_items .= '</div>';
  $cart_items .= '</div>';
  $cart_items .= '<p class="text-right">' . formatMoney($price) . '</p>';

  $i++;
}

$cart_summary .= '<h3 class="heading">Cart Total</h3>';
$cart_summary .= '<p>' . $cart_count . ($cart_count == 1 ? ' item' : ' items') . '</p>';
$cart_summary .= '<p>' . formatMoney($cart_total) . '</p>';

if(cartHasDelivery($cart)) {
  $cart_summary .= '<h3 class="heading">Delivery To</h3>';
  $cart_summary .= '<select id="delivery-suburb" name="delivery-suburb" class="select-css" onchange="updateDeliveryFee()">';
  $cart_summary .= '<option default disabled selected hidden value="">please choose</option>';
  foreach($delivery_fees as $suburb => $fee) {
    $cart_summary .= '<option ' . (strtolower($suburb) === strtolower($delivery_suburb) ? 'selected ' : '') . 'value="' . strtolower($suburb) . '">' . ucwords($suburb) . '&nbsp;</option>';
  }
  $cart_summary .= '</select>';
  $cart_summary .= '<p id="delivery-fee">' . (($delivery_suburb && $delivery_suburb != "none") ? formatMoney($delivery_fee) : 'TBC') . '</p>';
} else {
  $cart_summary .= '<input id="delivery-suburb" name="delivery-suburb" type="hidden" value="none">';
}

$cart_summary .= '<h3 class="top-border font-size-1 text-lowercase">TOTAL</h3>';
$cart_summary .= '<p class="top-border"></p>';
$cart_summary .= '<p id="total" class="top-border font-size-1">' . formatMoney($delivery_fee + $cart_total) . '</p>';

echo json_encode([
  'cart-items' => $cart_items,
  'cart-summary' => $cart_summary,
  'cart-total' => $cart_total
]);

?>
