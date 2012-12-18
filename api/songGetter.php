<?php

    session_start();

    if (isset($_POST['song']) && is_numeric($_POST['song'])) {
        $songID = $_POST['song'];
    } else {
        die("noSongID");
    }

    require("gsAPI.php");
    require("gsUser.php");
    
    $gsapi = new gsAPI('mrjohns42', 'bba5656f1e61bb000cc527f054d9640f');
    gsAPI::$headers = array("X-Client-IP: " . $_SERVER['REMOTE_ADDR']);

    if (isset($_SESSION['gsSession']) && !empty($_SESSION['gsSession'])) {
        $gsapi->setSession($_SESSION['gsSession']);
    } else {
        $_SESSION['gsSession'] = $gsapi->startSession();
    }

    if (!$_SESSION['gsSession']) {
        die("noSession");
    }
    if (isset($_SESSION['gsCountry']) && !empty($_SESSION['gsCountry'])) {
        $gsapi->setCountry($_SESSION['gsCountry']);
    } else {
        $_SESSION['gsCountry'] = $gsapi->getCountry();
    }
    if (!$_SESSION['gsCountry']) {
        die("noCountry");
    }
    
    $gsuser = new gsUser($gsapi);
    $gsuser->setUsername('mrjohns42');
    $gsuser->setTokenFromPassword('matmann2001');
    $gsuser->authenticate();
    $streamInfo = $gsuser->getSubscriberStreamKey($songID, false);
    //$streamInfo = $gsapi->getStreamKeyStreamServer($songID, false);
    echo json_encode($streamInfo);
    
?>
