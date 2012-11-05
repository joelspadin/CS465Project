<?php

	require_once 'tinysong.php';
	
	$api_key = '121900a05afcb2d386f0959aac76304b';
	
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