<?php
// process_login.php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/user_actions_config.php';
require_once __DIR__ . '/../../config/auth/validate.php';

// Start the session and generate a CSRF token
startSession();

// Check honeypot field to prevent spam bots
if (!empty($_POST['honeypot'])) {
    http_response_code(403);
    exit('403 Forbidden: Bot detected.');
}

// Load environment configuration
$config = getEnvironmentConfig();
$env = ($_SERVER['HTTP_HOST'] === 'localhost') ? 'local' : 'live';
$baseUrl = getBaseUrl($config, $_ENV['LIVE_URL']);

// Sanitize user input
$user_input = $_GET['input'] ?? '';
$sanitized_input = sanitize_input($user_input);

// Validate reCAPTCHA environment variables
try {
    validateReCaptchaEnvVariables();
} catch (RuntimeException $e) {
    // Jika terjadi error pada reCAPTCHA, hentikan eksekusi
    exit;
}

// Process Login
processLoginForm($env, $baseUrl, $config);
