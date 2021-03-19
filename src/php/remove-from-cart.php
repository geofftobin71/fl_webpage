<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

if(isset($_GET["i"])) {
  $i = intVal($_GET["i"]);
  if($i < count($_SESSION["cart"])) {
    $cart_item = $_SESSION["cart"][$i];
    if(isset($cart_item["stock-id"])) {
      $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
      if($cart_item["updated"] == $stock_item["updated"]) {
        $stock_item["updated"] = microtime(true) - $cart_reset_time;
        $stockStore->update($stock_item);
      }
    }
    array_splice($_SESSION["cart"], $i, 1);
    unset($_SESSION["error"]);
    $_SESSION["info"] = "1 item was removed from your cart";
  }
}
header("Location:/cart/");
exit;
?>
