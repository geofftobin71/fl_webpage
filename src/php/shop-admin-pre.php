<?php
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once $_SERVER['DOCUMENT_ROOT'] . '/../php/sleekdb-config.php';

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
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
    
    return $money;
}

function uniqueId($length = 8) {
    $bytes = random_bytes(ceil($length / 2));
    return substr(bin2hex($bytes), 0, $length);
}

use SleekDB\Store;
$categoryStore = new Store('categories', $sleekDir);
$productStore = new Store('products', $sleekDir);
$variantStore = new Store('variants', $sleekDir);
$itemStore = new Store('items', $sleekDir);

date_default_timezone_set('Pacific/Auckland');

?>