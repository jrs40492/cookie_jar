<?php
function sendSuccess($responseCode, $data) {
  http_response_code($responseCode);
  echo $data;
  exit;
}

function sendError($responseCode, $errors) {
  http_response_code($responseCode);
  echo json_encode(array("errors" => $errors));
  exit;
}