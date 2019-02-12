<?php
	require_once "includes/grill.inc.php";
	$grill = getGrill("small");

	if (headers_sent() === false)
			header("Location: {$grill}", true, 303);
?>