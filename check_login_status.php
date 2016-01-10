<?php if(!isset($_SESSION)){session_start();}
date_default_timezone_set('America/New_York');

$conx = mysqli_connect("localhost", "afcwcdb", "jrs40492", "afcwcdb_cookie");
if (mysqli_connect_error()) {echo mysqli_connect_error();
	exit();}
