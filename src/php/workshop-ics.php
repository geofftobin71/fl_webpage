<?php

header('Pragma: public');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false);
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="pickup-flowers.ics"');
header('Content-Transfer-Encoding: binary');

const input_date_format = "g:ia l j F Y";
const output_date_format = "c"; // "Y-m-d\TH:i:s";

date_default_timezone_set("Pacific/Auckland");

if(isset($_GET["w"])) {
  $workshop = $_GET["w"];
}

if(isset($_GET["s"])) {
  $session = date_create_from_format(input_date_format, $_GET["s"]);
}

include $_SERVER["DOCUMENT_ROOT"] . "/php/ICS.php";

$ics = new ICS(array(
  'location' => 'Floriade\, 18 Cambridge Terrace\, Te Aro\, Wellington',
  'description' => '',
  'dtstart' => date_format($session, output_date_format),
  'dtend' => date_format($session->add(new DateInterval('PT3H')), output_date_format),
  'summary' => $workshop,
  'url' => 'https://floriade.co.nz'
));

echo $ics->to_string();

?>
