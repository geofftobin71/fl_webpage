<?php

header('Pragma: public');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false);
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="invite.ics"');
header('Content-Transfer-Encoding: binary');

date_default_timezone_set("Pacific/Auckland");

include $_SERVER["DOCUMENT_ROOT"] . "/php/ICS.php";

$ics = new ICS(array(
  'location' => '18 Cambridge Terrace\, Te Aro\, Wellington',
  'description' => '',
  'dtstart' => '2021-5-28',
  'dtend' => '2021-5-28',
  'summary' => 'Pick up flowers from Floriade',
  'url' => 'https://floriade.co.nz'
));

echo $ics->to_string();

?>
