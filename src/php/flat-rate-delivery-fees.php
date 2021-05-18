<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

header('Content-Type: application/json');
echo json_encode($flat_rate_delivery_fees);

?>
