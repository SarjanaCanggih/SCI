<?php
// products.php

// Load config and dependencies
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/user_actions_config.php';

// start session if not already started
startSession(); // from user_actions_config.php

// Load dynamic URL configuration based on environment
$config = getEnvironmentConfig(); // Load environment configuration from config.php
$baseUrl = getBaseUrl($config, $_ENV['LIVE_URL']); // Get the base URL from the configuration from config.php
$isLive = $config['is_live'];
// Detect environment
$isLiveEnvironment = ($config['BASE_URL'] === $_ENV['LIVE_URL']);
setCacheHeaders($isLive); // Set header no cache in local from config.php
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Sarjana Canggih Indonesia</title>
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>favicon.ico" />
    <!-- Bootstrap css -->
    <link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>assets/vendor/css/bootstrap.min.css" />
    <!-- Font Awesome -->
    <link rel="stylesheet" type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
    <!-- Custom CSS -->
    <link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>assets/css/styles.css" />
</head>

<body style="background-color: #f7f9fb;">

    <!--========== INSERT HEADER ==========-->
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <!--========== AKHIR INSERT HEADER ==========-->

    <!--========== AREA SCROLL TO TOP ==========-->
    <div class="scroll">
        <!-- Scroll to Top Button -->
        <a href="#" class="scroll-to-top" id="scrollToTopBtn">
            <i class="fa-solid fa-angles-up"></i>
        </a>
    </div>
    <!--========== AKHIR AREA SCROLL TO TOP ==========-->

</body>

</html>