<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  exit;
}

$cart = $body["cart"];

foreach($cart as $cart_item) {
  if(isset($cart_item["stock-id"])) {
    $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
    if($cart_item["updated"] == $stock_item["updated"]) {
      $stock_item["updated"] = microtime(true) - $cart_reset_time;
      $stockStore->update($stock_item);
    }
  }
}

echo json_encode([]);

?>
