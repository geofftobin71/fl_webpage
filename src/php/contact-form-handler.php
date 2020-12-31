<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/../php/mail-config.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/../php/recaptcha-config-v3.php';

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

if ($_POST) {

  $name = clean($_POST['name']);
  $email_address = clean($_POST['email']);
  $subject = clean($_POST['subject']);
  $message = clean($_POST['message']);
  $email_heading = clean($_POST['heading']);
  $email_banner = clean($_POST['banner']);
  $alt_text = clean($_POST['alt']);

  $mail_template = file_get_contents('/email/contact-thankyou.html');
  $self_mail_template = file_get_contents('/email/contact-message.html');

  $placeholders = [
    '%name%',
    '%message%',
    '%email_heading%',
    '%email_banner%',
    '%alt%',
  ];

  $values = [
    $name,
    $message,
    $email_heading,
    $email_banner,
    $alt_text,
  ];

  $mail_body = str_replace($placeholders, $values, $mail_template);
  $self_mail_body = str_replace($placeholders, $values, $self_mail_template);

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
        $selfmail->setFrom($email_address, $name);
        $selfmail->addAddress('flowers@floriade.co.nz', 'Floriade');
        $selfmail->Subject = $subject;

        $selfmail->Body = $self_mail_body;

        $selfmail->send();

      } catch (Exception $e) {
        http_response_code(500);
        echo '<span style="color:red">There was a problem sending your message.<br>' . $selfmail->ErrorInfo . '</span>';
        return;
      }

      // ========== Confirmation Email ==========

      try {
        $mail->addAddress($email_address, $name);
        $mail->setFrom('flowers@floriade.co.nz', 'Floriade');
        $mail->Subject = $subject . ' (auto-reply)';

        $mail->Body = $mail_body;

        $mail->send();

      } catch (Exception $e) {
        http_response_code(500);
        echo '<span style="color:red">There was a problem sending your message.<br>' . $mail->ErrorInfo . '</span>';
        return;
      }

      header('Location: /thankyou-for-contacting-floriade');
      exit();

    } else {
      http_response_code(500);
      echo '<span style="color:red">There was a problem sending your message.<br>reCaptcha failed to verify your response.</span>';
      return;
    }
  } elseif($responseKeys["error-codes"]) {
    http_response_code(500);
    echo '<span style="color:red">There was a problem sending your message.<br>' . json_encode($responseKeys["error-codes"], JSON_PRETTY_PRINT) . '</span>';
    return;
  }
}
    /*
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, array(
      'secret' => $recaptcha_secret,
      'response' => $response,
      'remoteip' => $remoteip
    ));
    $curlData = curl_exec($curl);
    curl_close($curl);

    $recaptcha = json_decode($curlData, true);

    if ($recaptcha["success"]) {

      // ========== Contact Form Email ==========

      try {
        $selfmail->setFrom($email_address, $name);
        $selfmail->addAddress('flowers@floriade.co.nz', 'Floriade');
        $selfmail->Subject = $subject;

        $selfmail->Body = $self_mail_body;

        $selfmail->send();

      } catch (Exception $e) {
        http_response_code(500);
        echo '<span style="color:red">There was a problem sending your message.<br>' . $selfmail->ErrorInfo . '</span>';
        return;
      }

      // ========== Confirmation Email ==========

      try {
        $mail->addAddress($email_address, $name);
        $mail->setFrom('flowers@floriade.co.nz', 'Floriade');
        $mail->Subject = $subject . ' (auto-reply)';

        $mail->Body = $mail_body;

        $mail->send();

      } catch (Exception $e) {
        http_response_code(500);
        echo '<span style="color:red">There was a problem sending your message.<br>' . $mail->ErrorInfo . '</span>';
        return;
      }

      echo '<span style="color:#67902a">Thanks for contacting us. Your message was sent successfully.</span>';
    }
    else {
      http_response_code(500);
      echo '<span style="color:red">There was a problem sending your message.<br>reCaptcha failed to verify your response.</span>';
    }
     */

?>
