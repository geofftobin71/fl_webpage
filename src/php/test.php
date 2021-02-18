<?php
$categories = json_decode(file_get_contents('shop_categories.json', true));

foreach($categories as $category) {
  echo $category['name'];
}

?>
