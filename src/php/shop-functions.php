<?php
session_start();
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/www/html/error_log.txt');
error_reporting(E_ALL);

require_once $_SERVER['DOCUMENT_ROOT'] . '/../php/sleekdb-config.php';

use SleekDB\Store;
$stockStore = new Store('stock', $sleekDir, $sleekConfig);

date_default_timezone_set('Pacific/Auckland');

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

function criticalError($page, $message) {
    echo "<body style='text-align:center;font-family:sans-serif'><h1>Critical Error</h1><h2>" . $page . "</h2><p>" . $message . "</p></body>";
    exit;
}

function formatMoney($number) {
    if (!$number) {
        $money = '0';
    } else {
        $f = floatval($number);
        if (floor($f) == $f) {
            $money = number_format($f, 0);
        } else {
            $money = number_format(round($f, 2), 2);
        }
    }
    
    return '$' . $money;
}

function uniqueId($length = 8) {
    $bytes = random_bytes(ceil($length / 2));
    return substr(bin2hex($bytes), 0, $length);
}

function isFinite($product, $variant) {
  global $stockStore;
  $items = $stockStore->findBy([["product", "=", $product], "AND", ["variant", "=", $variant], "AND", ["unique", "=", true]]);
  return (count($items) > 0);
}

function stockCount($product, $variant) {
  global $stockStore;

  $ten_minutes_ago = new DateTime;
  $ten_minutes_ago->modify('-10 minutes');

  $items = $stockStore->findBy([
    ["product", "=", $product],
    "AND",
    ["variant", "=", $variant],
    "AND",
    ["unique", "=", true],
    "AND",
    ["sold", "=", false]
    /*
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
*/
  ]);

  return count($items);
}

function getStock($product, $variant) {
  global $stockStore;

  $ten_minutes_ago = new DateTime;
  $ten_minutes_ago->modify('-10 minutes');
  $ten_minutes_ago = $ten_minutes_ago->getTimestamp();

  $item = $stockStore->findOneBy([
    [
      ["product", "=", $product],
      "AND",
      ["variant", "=", $variant]
    ],
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
          [
            ["cart", "=", null]
          ],
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

if(!isset($_SESSION['cart'])) { $_SESSION['cart'] = array(); }
if(!isset($_SESSION['cart_id'])) { $_SESSION['cart_id'] = uniqueId(18); }

?>
