<?php
session_start();
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
ini_set("log_errors", 1);
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once $_SERVER["DOCUMENT_ROOT"] . "/../php/sleekdb-config.php";

use SleekDB\Store;
$stockStore = new Store("stock", $sleekDir, $sleekConfig);

date_default_timezone_set("Pacific/Auckland");

$shop_products = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/php/shop_products.json"), true);
$shop_categories = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/php/shop_categories.json"), true);
$delivery_fees = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/php/delivery_fees.json"), true);

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

function criticalError($page, $message) {
    echo "<body style=\"text-align:center;font-family:sans-serif\"><h1>Critical Error</h1><h2>" . $page . "</h2><p>" . $message . "</p>";
    // echo "<pre>"; print_r($_POST); echo "</pre>";
    // echo "<pre>"; print_r($_SESSION); echo "</pre>";
    echo "<br><a href='/'>Return to Home Page</a>";
    echo "</body>";
    exit;
}

function formatMoney($cents) {
    if (!$cents) {
      return "free";
    } else {
        $f = floatval($cents) / 100.0;
        if (floor($f) == $f) {
            $money = number_format($f, 0);
        } else {
            $money = number_format(round($f, 2), 2);
        }
    }
    
    return "$" . $money;
}

function uniqueId($length = 8) {
    $bytes = random_bytes(ceil($length / 2));
    return substr(bin2hex($bytes), 0, $length);
}

function getCategory($category_name) {
  global $shop_categories;
  foreach($shop_categories as $category) {
    if($category["name"] == $category_name) { return $category; }
  }

  return null;
}

function getProduct($product_id) {
  global $shop_products;
  foreach($shop_products as $product) {
    if($product["id"] == $product_id) { return $product; }
  }

  return null;
}

function getVariant($product, $variant_id) {
  if($product && $product["variants"]) {
    foreach($product["variants"] as $variant) {
      if($variant["id"] == $variant_id) { return $variant; }
    }
  }

  return null;
}

function hasVariants($product) {
  return ($product && $product["variants"] && (count($product["variants"]) > 0));
}

function getPrice($product, $variant_id) {
  if($product) {
    if($product["variants"]) {
      foreach($product["variants"] as $variant) {
        if($variant["id"] == $variant_id) { return $variant["price"] ? $variant["price"] : $product["price"]; }
      }
    }
    return $product["price"];
  } else {
    return null;
  }
}

function hasStock($product_id, $variant_id) {
  $product = getProduct($product_id);
  $variant = getVariant($product, $variant_id);

  if($variant) {
    if($variant["stock"]) { return true; }
  } else if($product) {
    if($product["stock"]) { return true; }
  }

  return false;
}

function stockCount($product_id, $variant_id) {
  global $stockStore;

  if(hasStock($product_id, $variant_id)) {
    $timeout = new DateTime;
    $timeout->modify("-20 minutes");
    $timeout = $timeout->getTimestamp();

    $items = $stockStore->findBy([
      ["product-id", "=", $product_id],
      "AND",
      ["variant-id", "=", $variant_id],
      "AND",
      ["sold", "=", false],
      "AND",
      ["updated", "<", $timeout]
    ]);

    return count($items);
  } else {
    return -1;
  }
}

function getStock($product_id, $variant_id) {
  global $stockStore;

  $timeout = new DateTime;
  $timeout->modify("-20 minutes");
  $timeout = $timeout->getTimestamp();

  $item = $stockStore->findOneBy([
    ["product-id", "=", $product_id],
    "AND",
    ["variant-id", "=", $variant_id],
    "AND",
    ["sold", "=", false],
    "AND",
    ["updated", "<", $timeout]
  ]);

  if($item) {
    $item["updated"] = (new DateTime)->getTimestamp();
    $stockStore->update($item);
  }

  return $item;
}

function cartHasParents($product_id) {
  $product = getProduct($product_id);
  if(!$product) { return false; }

  $category = getCategory($product["category"]);
  if($category && empty($category["parents"])) { return true; }

  foreach($_SESSION["cart"] as $cart_item) {
    $cart_product = getProduct($cart_item["product"]);
    if($cart_product && in_array($cart_product["category"], $category["parents"])) { return true; }
  }

  return false;
}

function listParents($product_id) {
  $product = getProduct($product_id);
  if(!$product) { return ""; }
  $category = getCategory($product["category"]);
  if(!$category) { return ""; }

  $result = "";
  $first = true;
  foreach($category["parents"] as $parent) {
    if(!$first) { $result .= " or "; }
    $result .= $parent;
    $first = false;
  }

  return $result;
}

function cartCount() {
  return count($_SESSION["cart"]);
}

function cartTotal() {
  $cart_total = 0;
  foreach($_SESSION["cart"] as $cart_item) {
    $product = getProduct($cart_item["product"]);
    if($product) {
      $price = getPrice($product, $cart_item["variant"]);
      $cart_total += $price;
    }
  }

  return $cart_total;
}

function cartHasDelivery() {
  foreach($_SESSION["cart"] as $cart_item) {
    $product = getProduct($cart_item["product"]);
    if(!$product) { return false; }
    $category = getCategory($product["category"]);

    if($category && $category["delivery"]) { return true; }
  }

  return false;
}

if(!isset($_SESSION["cart"])) { $_SESSION["cart"] = array(); }

?>
