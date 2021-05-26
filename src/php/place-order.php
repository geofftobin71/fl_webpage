<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/../php/mail-config.php";
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

if($_SERVER["REQUEST_METHOD"] === "POST") {

  if(isset($_POST["payment-intent-id"])) { $payment_intent_id = clean($_POST["payment-intent-id"]); }
  if(isset($_POST["card-brand"])) { $card_brand = clean($_POST["card-brand"]); }
  if(isset($_POST["card-month"])) { $card_month = clean($_POST["card-month"]); }
  if(isset($_POST["card-year"])) { $card_year = clean($_POST["card-year"]); }
  if(isset($_POST["card-last4"])) { $card_last4 = clean($_POST["card-last4"]); }
  if(isset($_POST["delivery-option"])) { $delivery_option = clean($_POST["delivery-option"]); }
  if(isset($_POST["delivery-name"])) { $delivery_name = clean($_POST["delivery-name"]); }
  if(isset($_POST["delivery-phone"])) { $delivery_phone = clean($_POST["delivery-phone"]); }
  if(isset($_POST["delivery-address"])) { $delivery_address = clean($_POST["delivery-address"]); }
  if(isset($_POST["delivery-suburb"])) { $delivery_suburb = clean($_POST["delivery-suburb"]); } else { $delivery_suburb = ""; }
  if(isset($_POST["delivery-date"])) { $delivery_date = clean($_POST["delivery-date"]); } else { $delivery_date = ""; }
  if(isset($_POST["gift-tag-message"])) { $gift_tag_message = clean($_POST["gift-tag-message"]); }
  if(isset($_POST["special-requests"])) { $special_requests = clean($_POST["special-requests"]); }
  if(isset($_POST["cardholder-name"])) { $cardholder_name = clean($_POST["cardholder-name"]); }
  if(isset($_POST["cardholder-email"])) { $cardholder_email = clean($_POST["cardholder-email"]); }
  if(isset($_POST["cardholder-phone"])) { $cardholder_phone = clean($_POST["cardholder-phone"]); }
  if(isset($_POST["workshop-attendee-name"])) { $workshop_attendee_name = $_POST["workshop-attendee-name"]; }
  if(isset($_POST["workshop-attendee-email"])) { $workshop_attendee_email = $_POST["workshop-attendee-email"]; }
  if(isset($_POST["cart"])) { $cart = json_decode($_POST["cart"], true); }
  if(isset($_POST["cart-total-check"])) { $cart_total = intVal(clean($_POST["cart-total-check"])); }
  if(isset($_POST["delivery-total-check"])) { $delivery_fee = intVal(clean($_POST["delivery-total-check"])); }

  if(empty($payment_intent_id)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing payment_intent_id')); exit; }
  if(empty($card_brand)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing card_brand')); exit; }
  if(empty($card_month)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing card_month')); exit; }
  if(empty($card_year)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing card_year')); exit; }
  if(empty($card_last4)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing card_last4')); exit; }
  if(empty($delivery_option)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing delivery_option')); exit; }
  if(empty($cardholder_name)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing cardholder_name')); exit; }
  if(empty($cardholder_email)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing cardholder_email')); exit; }
  if(empty($cardholder_phone)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing cardholder_phone')); exit; }
  if(empty($cart)) { header('Location:/shop-error/?p=' . urlencode('Error: Missing cart')); exit; }
  if($cart_total < 1) { header('Location:/shop-error/?p=' . urlencode('Error: Zero cart total')); exit; }

  $order_date = new DateTime;

  $product_names = array();
  $variant_names = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $product_names[$cart_id] = $product["name"];
      $variant = getVariant($product, $cart_item["variant-id"]);
      if(isset($variant)) {
        $variant_names[$cart_id] = $variant["name"];
      } else {
        $variant_names[$cart_id] = "";
      }
    }
  }

  $bookings = array();
  $order_items = array();
  $order_tickets = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $category = getCategory($product["category"]);
      $price = getPrice($product, $cart_item["variant-id"]);
      if(isset($category)) {
        if(strtolower($category["name"]) === "workshops") {
          $bookings[] = array(
            "payment-id" => $payment_intent_id,
            "timestamp" => $order_date->format('g:ia D, j M, Y'),
            "workshop" => $product_names[$cart_id],
            "session" => $variant_names[$cart_id],
            "name" => $workshop_attendee_name[$cart_id],
            "email" => $workshop_attendee_email[$cart_id],
            "price" => $price,
            "cardholder-name" => $cardholder_name,
            "cardholder-email" => $cardholder_email,
            "cardholder-phone" => $cardholder_phone,
            "card-brand" => $card_brand,
            "card-month" => $card_month,
            "card-year" => $card_year,
            "card-last4" => $card_last4,
          );

          $order_tickets[] = array(
            "workshop" => $product_names[$cart_id],
            "session" => $variant_names[$cart_id],
            "price" => $price,
            "name" => $workshop_attendee_name[$cart_id],
            "email" => $workshop_attendee_email[$cart_id],
          );
        } else {
          $order_items[] = array(
            "product" => $product_names[$cart_id],
            "variant" => $variant_names[$cart_id],
            "price" => $price,
          );
        }
      }
    }
  }

  $order = array(
    "payment-id" => $payment_intent_id,
    "timestamp" => $order_date->format('g:ia D, j M, Y'),
    "delivery-option" => ucwords($delivery_option),
    "delivery-name" => $delivery_name,
    "delivery-phone" => $delivery_phone,
    "delivery-address" => $delivery_address,
    "delivery-suburb" => ucwords($delivery_suburb),
    "delivery-date" => $delivery_date,
    "gift-tag-message" => $gift_tag_message,
    "special-requests" => $special_requests,
    "cardholder-name" => $cardholder_name,
    "cardholder-email" => $cardholder_email,
    "cardholder-phone" => $cardholder_phone,
    "card-brand" => $card_brand,
    "card-month" => $card_month,
    "card-year" => $card_year,
    "card-last4" => $card_last4,
    "items" => $order_items,
    "tickets" => $order_tickets,
    "cart-total" => $cart_total,
    "delivery-fee" => $delivery_fee,
    "total" => $cart_total + $delivery_fee,
  );

  /* FIXME
  foreach($cart as $cart_item) {
    if(isset($cart_item["stock-id"])) {
      $stock_item = $stockStore->findOneBy(["stock-id", "=", $cart_item["stock-id"]]);
      if($cart_item["updated"] == $stock_item["updated"]) {
        $stock_item["sold"] = true;
        $stockStore->update($stock_item);
      }
    }
  }

  $orderStore->insert($order);

  foreach($bookings as $booking) {
    $workshopStore->insert($booking);
  }
  FIXME */
 
  $mail_template = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/email/shop-receipt.html");

  $email_banner = 'site/floriade-dried-flower-room-00001';
  $alt_text = "Floriade";

  $product = getProduct($cart[0]["product-id"]);

  if(isset($product)) {
    $email_banner = $product["images"][array_rand($product["images"],1)];
  }

  $divider = '<tr><td colspan="2"><div class="spacer" style="line-height:13px;height:13px;mso-line-height-rule:exactly;">&nbsp;</div><hr><div class="spacer" style="line-height:13px;height:13px;mso-line-height-rule:exactly;">&nbsp;</div></td></tr>';
  $spacer = '<tr><td><br></td><td><br></td></tr>';

  // Order Confirmation Email

  $content = '';
  $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
  $content .= $divider;
  $content .= '<tr><td style="vertical-align:top">Order ID</td><td style="text-align:right;vertical-align:top"><small>' . $order["payment-id"] . '</small></td></tr>';
  $content .= '<tr><td style="vertical-align:top">Order Date</td><td style="text-align:right;vertical-align:top">' . $order["timestamp"] . '</td></tr>';
  $content .= $divider;
  $content .= '</table>';

  // Pickup

  if(strtolower($delivery_option) === "pickup") {
    $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
    $content .= '<tr><td colspan="2"><h3 style="text-align:center">Pickup Details</h3></td></tr>';
    $content .= '<tr><td style="vertical-align:top">Recipient Name</td><td style="text-align:right;vertical-align:top">' . $order["delivery-name"] . '</td></tr>';
    $content .= $spacer;
    $content .= '<tr><td style="vertical-align:top">Pickup in Store</td><td style="text-align:right;vertical-align:top"><a href="https://goo.gl/maps/jGdMssVmNamjZXA4A" title="Open in Google Maps" aria-label="Open in Google Maps" target="_blank" rel="noopener">18 Cambridge Terrace<br>Te Aro<br>Wellington</a></td></tr>';
    $content .= $spacer;
    $content .= '<tr><td style="vertical-align:top">Pickup Date</td><td style="text-align:right;vertical-align:top">' . $order["delivery-date"] . '</td></tr>';
    $content .= $divider;
    $content .= '</table>';
  }

  // Delivery

  if(strtolower($delivery_option) === "delivery") {
    $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
    $content .= '<tr><td colspan="2"><h3 style="text-align:center">Delivery Details</h3></td></tr>';
    $content .= '<tr><td style="vertical-align:top">Recipient Name</td><td style="text-align:right;vertical-align:top">' . $order["delivery-name"] . '</td></tr>';
    $content .= '<tr><td style="vertical-align:top">Recipient Phone</td><td style="text-align:right;vertical-align:top">' . $order["delivery-phone"] . '</td></tr>';
    $content .= $spacer;
    $content .= '<tr><td style="vertical-align:top">Delivery Address</td><td style="text-align:right;vertical-align:top">' . $order["delivery-address"] . '<br>' . $order["delivery-suburb"] . '</td></tr>';
    $content .= $spacer;
    $content .= '<tr><td style="vertical-align:top">Delivery Date</td><td style="text-align:right;vertical-align:top">' . $order["delivery-date"] . '</td></tr>';
    $content .= $divider;
    $content .= '</table>';
  }

  // Gift tag Message

  if(!empty($gift_tag_message)) {
    $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
    $content .= '<tr><td colspan="2"><h3 style="text-align:center">Gift tag Message</h3></td></tr>';
    $content .= '<tr><td colspan="2"><p>' . $gift_tag_message . '</p></td></tr>';
    $content .= $divider;
    $content .= '</table>';
  }

  // Special Requests

  if(!empty($special_requests)) {
    $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
    $content .= '<tr><td colspan="2"><h3 style="text-align:center">Special Requests</h3></td></tr>';
    $content .= '<tr><td colspan="2"><p>' . $special_requests . '</p></td></tr>';
    $content .= $divider;
    $content .= '</table>';
  }

  // Order Summary

  $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
  $content .= '<tr><td colspan="2"><h3 style="text-align:center">Order Summary</h3></td></tr>';

  foreach($order["items"] as $item) {
    $content .= '<tr><td style="vertical-align:top">' . $item["product"];
    if(!empty($item["variant"])) { $content .= ' (' . $item["variant"] . ')'; }
    $content .= '</td><td style="text-align:right;vertical-align:top">' . formatMoney($item["price"]) . '</td></tr>';
  }

  foreach($order["tickets"] as $ticket) {
    $content .= '<tr><td style="vertical-align:top">' . $ticket["workshop"] . '<br>' . $ticket["session"] . '<br><small>' . $ticket["name"] . ' - ' . $ticket["email"] . '</small></td><td style="text-align:right;vertical-align:top">' . formatMoney($ticket["price"]) . '</td></tr>';
  }

  if(strtolower($delivery_option) === "pickup") {
    $content .= $divider;
    $content .= '<tr><td style="vertical-align:top">Cart Total</td><td style="text-align:right;vertical-align:top">' . formatMoney($order["cart-total"]) . '</td></tr>';
    $content .= '<tr><td style="vertical-align:top">Pickup in Store</td><td style="text-align:right;vertical-align:top">free</td></tr>';
  }

  if(strtolower($delivery_option) === "delivery") {
    $content .= $divider;
    $content .= '<tr><td style="vertical-align:top">Cart Total</td><td style="text-align:right;vertical-align:top">' . formatMoney($order["cart-total"]) . '</td></tr>';
    $content .= '<tr><td style="vertical-align:top">Delivery to ' . $order["delivery-suburb"] . '</td><td style="text-align:right;vertical-align:top">' . formatMoney($order["delivery-fee"]) . '</td></tr>';
  }

  $content .= $divider;
  $content .= '<tr><td style="vertical-align:top">TOTAL</td><td style="text-align:right;vertical-align:top">' . formatMoney($order["total"]) . '</td></tr>';
  $content .= '</table>';

  // Payment

  $content .= '<table role="presentation" width="100%" style="font-family:Arial,sans-serif">';
  $content .= $divider;
  $content .= '<tr><td colspan="2"><h3 style="text-align:center">Payment Details</h3></td></tr>';
  $content .= '<tr><td style="vertical-align:top">Name</td><td style="text-align:right;vertical-align:top">' . $order["cardholder-name"] . '</td></tr>';
  $content .= '<tr><td style="vertical-align:top">Email</td><td style="text-align:right;vertical-align:top">' . $order["cardholder-email"] . '</td></tr>';
  $content .= '<tr><td style="vertical-align:top">Phone</td><td style="text-align:right;vertical-align:top">' . $order["cardholder-phone"] . '</td></tr>';
  $content .= '<tr><td style="vertical-align:top">Card</td><td style="text-align:right;vertical-align:top">' . $order["card-brand"] . ' #### #### #### ' . $order["card-last4"] . ' ' . $order["card-month"] . '/' . substr($order["card-year"],2) . '</td></tr>';
  $content .= '<tr><td colspan="2"><div class="spacer" style="line-height:13px;height:13px;mso-line-height-rule:exactly;">&nbsp;</div><hr></td></tr>';
  $content .= '<tr><td colspan="2"><p style="text-align:center"><small>All prices are in New Zealand dollars and include GST</small></p></td></tr>';
  $content .= '</table>';

  $placeholders = [
    "%email_heading%",
    "%email_banner%",
    "%brightness%",
    "%alt%",
    "%content%",
  ];

  $values = [
    "Thankyou for your order",
    $email_banner,
    33,
    $alt_text,
    $content,
  ];

  $mail_body = str_replace($placeholders, $values, $mail_template);

  /* DEBUG
  echo $mail_body;
  exit;
  DEBUG */

  // Confirmation Email

  try {
    $mail->addAddress($cardholder_email, $cardholder_name);
    $mail->setFrom('flowers@floriade.co.nz', 'Floriade');
    $mail->Subject = 'Floriade Receipt (Order ' . $payment_intent_id . ')';

    $mail->Body = $mail_body;

    // FIXME $mail->send();

  } catch (Exception $e) {
    header('Location:/thankyou-for-your-order/?p=' . urlencode($cardholder_email . '<br><br>But something went wrong sending the email :<br>' . $mail->ErrorInfo));
    exit;
  }

  header('Location:/thankyou-for-your-order/?p=' . urlencode($cardholder_email));
  exit();

}

?>
