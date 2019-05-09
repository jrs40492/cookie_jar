<?php if(!isset($_SESSION)) {
	session_start();
}

require 'config.php';

date_default_timezone_set('America/New_York');

try {
  $conx = new PDO('mysql:host=localhost;dbname=afcwcdb_cookie', $dbUser, $dbPass);
} catch (PDOException $e) {
  print "Error!: " . $e->getMessage() . "<br/>";
  die();
}
