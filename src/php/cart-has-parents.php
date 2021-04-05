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

$product_id = $body["product-id"];
$cart = $body["cart"];
$result = false;

$product = getProduct($product_id);
if(isset($product)) {
  $category = getCategory($product["category"]);
  if(isset($category) && empty($category["parents"])) {
    $result = true;
  } else {
    foreach($cart as $cart_item) {
      $cart_product = getProduct($cart_item["product-id"]);
      if(isset($cart_product) && isset($cart_product["category"]) && in_array($cart_product["category"], $category["parents"])) {
        $result = true;
      }
    }
  }
}

echo json_encode(['result' => $result]);

?>
