<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

$id = $_GET['session_id'];
$checkout_items = $stripe->checkout->sessions->allLineItems($id,['limit' => 100,'expand' => ['data.price.product']]);

echo json_encode($checkout_items);
?>
