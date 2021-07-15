<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

$id = $_GET['payment_intent_id'];
$payment_intent = $stripe->paymentIntents->retrieve($id);

echo json_encode($payment_intent);
?>
