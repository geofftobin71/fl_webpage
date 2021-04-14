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
$result = false;

foreach($cart as $cart_item) {
  $cart_product = getProduct($cart_item["product-id"]);
  if(isset($cart_product)) {
    $cart_category = getCategory($cart_product["category"]);
    if(isset($cart_category)) {
      if($cart_category["delivery"]) {
        $result = true;
      }
    }
  }
}

echo json_encode(['result' => $result]);

?>
