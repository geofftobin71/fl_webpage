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

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

function criticalError($page, $message) {
    echo "<body style=\"text-align:center;font-family:sans-serif\"><h1>Critical Error</h1><h2>" . $page . "</h2><p>" . $message . "</p>";
    echo "<pre>"; print_r($_POST); echo "</pre>";
    echo "<pre>"; print_r($_SESSION); echo "</pre>";
    echo "</body>";
    exit;
}

function formatMoney($cents) {
    if (!$cents) {
        $money = "0";
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
  foreach($product["variants"] as $variant) {
    if($variant["id"] == $variant_id) { return $variant; }
  }

  return null;
}

function hasVariants($product) {
  return (isset($product["variants"]) && (count($product["variants"]) > 0));
}

function getPrice($product, $variant_id) {
  foreach($product["variants"] as $variant) {
    if($variant["id"] == $variant_id) { return $variant["price"] ? $variant["price"] : $product["price"]; }
  }

  return $product["price"];
}

function isFinite($product_id, $variant_id) {
  global $stockStore;
  $items = $stockStore->findBy([["product", "=", $product_id], "AND", ["variant", "=", $variant_id], "AND", ["unique", "=", true]]);
  return (count($items) > 0);
}

function stockCount($product_id, $variant_id) {
  global $stockStore;

  $ten_minutes_ago = new DateTime;
  $ten_minutes_ago->modify("-10 minutes");
  $ten_minutes_ago = $ten_minutes_ago->getTimestamp();

  $items = $stockStore->findBy([
    ["product", "=", $product_id],
    "AND",
    ["variant", "=", $variant_id],
    "AND",
    ["unique", "=", true],
    "AND",
    ["sold", "=", false],
    "AND",
    [
      ["cart", "=", null],
      "OR",
      [
        ["cart", "!=", null],
        "AND",
        ["updated", "<", $ten_minutes_ago]
      ]
    ]
  ]);

  return count($items);
}

function getStock($product_id, $variant_id) {
  global $stockStore;

  $ten_minutes_ago = new DateTime;
  $ten_minutes_ago->modify("-10 minutes");
  $ten_minutes_ago = $ten_minutes_ago->getTimestamp();

  $item = $stockStore->findOneBy([
    ["product", "=", $product_id],
    "AND",
    ["variant", "=", $variant_id],
    "AND",
    [
      ["unique", "=", false],
      "OR",
      [
        ["unique", "=", true],
        "AND",
        ["sold", "=", false],
        "AND",
        [
          ["cart", "=", null],
          "OR",
          [
            ["cart", "!=", null],
            "AND",
            ["updated", "<", $ten_minutes_ago]
          ]
        ]
      ]
    ]
  ]);

  return $item;
}

if(!isset($_SESSION["cart"])) { $_SESSION["cart"] = array(); }
if(!isset($_SESSION["cart_id"])) { $_SESSION["cart_id"] = uniqueId(18); }

?>
