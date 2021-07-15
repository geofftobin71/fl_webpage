<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

$id = $_GET['product_id'];
$product = $stripe->products->retrieve($id);

echo json_encode($product);
?>
