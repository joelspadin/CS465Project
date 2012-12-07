<?php

	require_once 'tinysong.php';
	
	$keys = array(
		'67b088cec7b78a5b29a42a7124928c87',
		'd9ec40ec6e1913c6904b99fcf469bbcd',
		'121900a05afcb2d386f0959aac76304b',
		'd4b6a5b1209e00867bf0063bc1448ddb',
	//	'',
	//	'',
	);
	$api_key = $keys[rand(0, count($keys) - 1)];
	
	$query = $_GET['query'];
	if (isset($_GET['limit']))
		$limit = $_GET['limit'];
	else
		$limit = '1';
	
	$tinysong = new Tinysong($api_key);
	
	$result = $tinysong
				->limit($limit)
	            ->search($query)
	            ->execute();
	
	if (empty($result))
		echo 'null';
	else
		echo json_encode($result);

?>