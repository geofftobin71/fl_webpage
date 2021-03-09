<?php include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php"; ?>

<?php

$page = "Add to Cart";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  $product_id = clean($_POST["product_id"]);
  if(empty($product_id)) { criticalError($page, "No Product ID"); }

  $variant_id = clean($_POST["variant_id"]);
  if(empty($variant_id)) { criticalError($page, "No Variant ID"); }

  $return_url = clean($_POST["return_url"]);
  if(empty($return_url)) { criticalError($page, "No Return URL"); }

  $product_count = intval(clean($_POST["product_count"]));
  $product_count = ($product_count < 1) ? 1 : $product_count;

  $_SESSION["product_id"] = $product_id;
  $_SESSION["variant_id"] = $variant_id;
  $_SESSION["product_count"] = $product_count;

  if(isFinite($product_id, $variant_id)) {
    $stock_count = stockCount($product_id, $variant_id);

    if($product_count > $stock_count) {
      $_SESSION["product_count"] = $stock_count;
      $_SESSION["error"] = "Number must be less than or equal to " . $stock_count;
      header("Location:" . $return_url . "#add-to-cart-form");
      exit;
    }
  }

  /*
  echo "Product ID: " . $_POST["product_id"] . "<br>";
  echo "Variant ID: " . $_POST["variant_id"] . "<br>";
  echo "Product count: " . $_POST["product_count"] . "<br>";
  echo "Return URL: " . $_POST["return_url"] . "<br>";
   */

  $items_added = 0;

  for($i = 0; $i < $product_count; $i++) {
    $item = getStock($product_id, $variant_id);

    if($item) {
      $_SESSION["cart"][] = { "id" => $item["id"] };

      if($item["unique"]) {
        $item["cart"] = $_SESSION["cart_id"];
        $item["updated"] = (new DateTime)->getTimestamp();

        $stockStore->update($item);
      }

      $items_added++;
    }
  }

  if($items_added == $product_count) {
    unset($_SESSION["error"]);
    $_SESSION["info"] = $items_added . " items were added to your cart";
  } else {
    unset($_SESSION["info"]);
    $_SESSION["error"] = "Only " . $items_added . " items could be added to your cart";
  }

  unset($_SESSION["product_id"]);
  unset($_SESSION["variant_id"]);
  unset($_SESSION["product_count"]);

  header("Location:/cart/");
  exit;
}

?>
