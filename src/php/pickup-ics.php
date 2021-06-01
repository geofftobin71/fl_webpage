<?php

header('Pragma: public');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false);
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="pickup-flowers.ics"');
header('Content-Transfer-Encoding: binary');

const input_date_format = "l j F Y";
const output_date_format = "Y-m-d";

date_default_timezone_set("Pacific/Auckland");

if(isset($_GET["d"])) {
  $pickup_date = date_create_from_format(input_date_format, $_GET["d"]);
  $pickup_date->setTime(0,0);
} else {
  $pickup_date = new DateTime();
}

include $_SERVER["DOCUMENT_ROOT"] . "/php/ICS.php";

$ics = new ICS(array(
  'location' => '18 Cambridge Terrace\, Te Aro\, Wellington',
  'description' => '',
  'dtstart' => date_format($pickup_date, output_date_format),
  'dtend' => date_format($pickup_date, output_date_format),
  'summary' => 'Pick up flowers from Floriade',
  'url' => 'https://floriade.co.nz'
));

echo $ics->to_string();

?>
