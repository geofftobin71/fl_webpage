<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

$products = $stripe->products->all(['active' => false, 'limit' => 100]);

echo json_encode($products);
?>
