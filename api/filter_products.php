<?php
// filter_products.php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/user_actions_config.php';
require_once __DIR__ . '/../config/products/product_functions.php';
require_once __DIR__ . '/../config/api/api_functions.php';

startSession();
$config = getEnvironmentConfig();

// Ambil parameter
$categories = isset($_GET['categories']) ? (array)$_GET['categories'] : null;
$minPrice = $_GET['min_price'] ?? null;
$maxPrice = $_GET['max_price'] ?? null;
$sortBy = $_GET['sort_by'] ?? 'created';
$sortOrder = $_GET['sort_order'] ?? 'DESC';

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

// Mapping sorting
if ($sortBy === 'price_low') {
    $sortBy = 'price';
    $sortOrder = 'ASC';
} elseif ($sortBy === 'price_high') {
    $sortBy = 'price';
    $sortOrder = 'DESC';
}

// Get filtered products
$products = getFilteredActiveProducts(
    $categories,
    $minPrice,
    $maxPrice,
    $sortBy,
    $sortOrder
);

// Format response
$baseUrl = getBaseUrl($config, $_ENV['LIVE_URL']);
$response = [];
foreach ($products as $product) {
    $response[] = [
        'image' => $product['image_path'] ? $baseUrl . $product['image_path'] : $baseUrl . 'assets/images/default-product.png',
        'name' => htmlspecialchars($product['product_name']),
        'description' => htmlspecialchars($product['description']),
        'price' => $product['currency'] . ' ' . number_format($product['price_amount'], 0, ',', '.'),
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
