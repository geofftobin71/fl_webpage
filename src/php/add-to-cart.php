<?php include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php"; ?>

<?php

$product_id = "";
$variant_id = "";
$product_count = 0;
$return_url = "";
$variant_error = "Please choose an option";

$page = "Add to Cart";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  if(isset($_POST["product-id"])) { $product_id = clean($_POST["product-id"]); }
  if(empty($product_id)) { criticalError($page, "No Product ID"); }

  if(isset($_POST["return-url"])) { $return_url = clean($_POST["return-url"]); }
  if(empty($return_url)) { criticalError($page, "No Return URL"); }

  if(isset($_POST["variant-error"])) { $variant_error = clean($_POST["variant-error"]); }

  if(isset($_POST["variant-id"])) { $variant_id = clean($_POST["variant-id"]); }
  if(empty($variant_id)) {
      $_SESSION["error"] = $variant_error;
      header("Location:" . $return_url);
      exit;
  }

  if(isset($_POST["product-count"])) { $product_count = intval(clean($_POST["product-count"])); }
  $product_count = ($product_count < 1) ? 1 : $product_count;

  $_SESSION["product-id"] = $product_id;
  $_SESSION["variant-id"] = $variant_id;
  $_SESSION["product-count"] = $product_count;

  $stock_count = stockCount($product_id, $variant_id);

  if(($stock_count > 0) && ($product_count > $stock_count)) {
    $_SESSION["product-count"] = $stock_count;
    $_SESSION["error"] = "Number must be less than or equal to " . $stock_count;
    header("Location:" . $return_url);
    exit;
  }

  if($stock_count == 0) {
    $_SESSION["product-count"] = 0;
    $_SESSION["error"] = "This product has sold out";
    header("Location:" . $return_url);
    exit;
  }

  $items_added = 0;

  for($i = 0; $i < $product_count; $i++) {
    $stock_count = stockCount($product_id, $variant_id);

    if($stock_count > 0) {
      $item = getStock($product_id, $variant_id);

      if($item) {
        $_SESSION["cart"][] = array(
          "product-id" => $item["product-id"],
          "variant-id" => $item["variant-id"],
          "stock-id" => $item["stock-id"],
          "updated" => $item["updated"]
        );

        $items_added++;
      }
    } else if($stock_count < 0) {
      $_SESSION["cart"][] = array(
        "product-id" => $product_id,
        "variant-id" => $variant_id
      );

      $items_added++;
    }
  }

  if($items_added == $product_count) {
    unset($_SESSION["error"]);
    $_SESSION["info"] = $items_added . ($items_added == 1 ? " item was" : " items were") . " added to your cart";
  } else {
    unset($_SESSION["info"]);
    $_SESSION["error"] = $items_added . " of " . $product_count . " items could be added to your cart";
  }

  unset($_SESSION["product-id"]);
  unset($_SESSION["variant-id"]);
  unset($_SESSION["product-count"]);

  header("Location:/cart/");
  exit;
}

?>
