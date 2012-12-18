<?php

	require_once 'tinysong.php';
	
	$api_key = 'd9ec40ec6e1913c6904b99fcf469bbcd';
	
	$query = $_GET['query'];
	
	$tinysong = new Tinysong($api_key);
	
	$result = $tinysong
	            ->single_tinysong_metadata($query)
	            ->execute();
	
	echo $_GET['callback'] . "(" . json_encode($result) . ");";

?>
