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

$i = intVal($body["index"]);
$cart = $body["cart"];

if($i < count($cart)) {
  $cart_item = $cart[$i];
  if(isset($cart_item["stock-id"])) {
    $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
    if($cart_item["updated"] == $stock_item["updated"]) {
      $stock_item["updated"] = microtime(true) - $cart_reset_time;
      $stockStore->update($stock_item);
    }
  }
  array_splice($cart, $i, 1);
}

echo json_encode(['cart' => $cart]);

?>
