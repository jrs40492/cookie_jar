<?php require '../auth.php';
require '../functions.php';

$getTypes = $conx->prepare(
  "SELECT *
  FROM types
  WHERE is_active = 1
  ORDER BY sequence");
$getTypes->execute([]);

$types = [];
while ($type = $getTypes->fetch()) {
  $types[] = $type;
}
sendSuccess(200, json_encode($types), JSON_NUMERIC_CHECK);