<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

$id = $_GET['session_id'];
$checkout_session = $stripe->checkout->sessions->retrieve($id, ['expand' => ['payment_intent']]);

echo json_encode($checkout_session);
?>
