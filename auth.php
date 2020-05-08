<?php if(!isset($_SESSION)) {
	session_start();
}

$connection = "mysql:host=" . getenv('SQL_HOST') . ";dbname=" . getenv('DB_NAME') . ";";

if (!empty(getenv('SQL_PORT'))) {
  $connection .= "port=" . getenv('SQL_PORT') . ";";
}

date_default_timezone_set('America/New_York');

$options = [
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $conx = new PDO($connection, getenv('SQL_USER'), getenv('SQL_PASS'), $options);
} catch (PDOException $e) {
  print "Error!: " . $e->getMessage() . "<br/>";
  die();
}
