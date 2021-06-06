<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/../php/mail-config.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/../php/recaptcha-config-v3.php";

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

if($_SERVER["REQUEST_METHOD"] === "POST") {

  $name = clean($_POST["name"]);
  $email_address = clean($_POST["email"]);
  $subject = clean($_POST["subject"]);
  $message = clean($_POST["message"]);
  $email_heading = clean($_POST["heading"]);
  $email_banner = clean($_POST["banner"]);
  $brightness = clean($_POST["brightness"]);
  $alt_text = clean($_POST["alt"]);

  $mail_template = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/email/contact-thankyou.html");
  $self_mail_template = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/email/contact-message-plain.txt");

  $placeholders = [
    "%name%",
    "%message%",
    "%email_heading%",
    "%email_banner%",
    "%brightness%",
    "%alt%",
  ];

  $values = [
    $name,
    $message,
    $email_heading,
    $email_banner,
    $brightness,
    $alt_text,
  ];

  $mail_body = str_replace($placeholders, $values, $mail_template);
  $self_mail_body = str_replace($placeholders, $values, $self_mail_template);

  /* DEBUG
  echo $mail_body;
  exit;
   */

  // ========== reCaptcha ==========

  $g_recaptcha_response = $_POST["g-recaptcha-response"];
  $remote_ip = $_SERVER["REMOTE_ADDR"];
  $url = 'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($recaptcha_secret) . '&response=' . urlencode($g_recaptcha_response) . '&remoteip=' . urlencode($remote_ip);

  $response = file_get_contents($url);
  $responseKeys = json_decode($response, true);

  if($responseKeys["success"] && $responseKeys["action"] == 'contactform') {
    if($responseKeys["score"] >= 0.5) {

      // ========== Contact Form Email ==========

      try {
        $selfmail->ContentType = 'text/plain';
        $selfmail->isHTML(false);
        $selfmail->setFrom($email_address, $name);
        $selfmail->clearAddresses();
        $selfmail->addAddress('flowers@floriade.co.nz', 'Floriade');
        $selfmail->Subject = $subject;

        $selfmail->Body = $self_mail_body;

        $selfmail->send();

      } catch (Exception $e) {
        header('Location:/contact-form-error/?p=' . urlencode($mail->ErrorInfo));
        exit;
      }

      // ========== Confirmation Email ==========

      try {
        $mail->clearAddresses();
        $mail->addAddress($email_address, $name);
        $mail->setFrom('flowers@floriade.co.nz', 'Floriade');
        $mail->Subject = $subject . ' (auto-reply)';

        $mail->Body = $mail_body;

        $mail->send();

      } catch (Exception $e) {
        header('Location:/contact-form-error/?p=' . urlencode($mail->ErrorInfo));
        exit;
      }

      header('Location:/thankyou-for-contacting-floriade/');
      exit();

    } else {
      header('Location:/contact-form-error/?p=' . urlencode('reCaptcha failed to verify your response'));
      exit;
    }
  } elseif($responseKeys["error-codes"]) {
    header('Location:/contact-form-error/?p=' . urlencode(json_encode($responseKeys["error-codes"], JSON_PRETTY_PRINT)));
    exit;
  }
}

?>
