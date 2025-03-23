<?php
// products.php

// Load config dan dependencies
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/user_actions_config.php';
require_once __DIR__ . '/../../config/products/product_functions.php';

// Mulai session jika belum dimulai
startSession();

// Load konfigurasi URL dinamis berdasarkan environment
$config = getEnvironmentConfig();
$baseUrl = getBaseUrl($config, $_ENV['LIVE_URL']);
$isLive = $config['is_live'];
$isLiveEnvironment = ($config['BASE_URL'] === $_ENV['LIVE_URL']);
setCacheHeaders($isLive);

// Ambil data produk aktif
$activeProducts = getActiveProductsWithImages($config, $env);

// Proses data produk untuk ditampilkan
$productsData = [];
if (!empty($activeProducts)) {
    foreach ($activeProducts as $product) {
        $images = explode(', ', $product['images']);
        $productsData[] = [
            'image' => !empty($images[0]) ? $images[0] : $baseUrl . 'assets/images/default-product.png',
            'name' => htmlspecialchars($product['product_name']),
            'description' => htmlspecialchars($product['description']),
            'price' => $product['currency'] . ' ' . number_format($product['price_amount'], 0, ',', '.'),
        ];
    }
}
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

    <!--========== AREA BANNER ==========-->
    <section class="py-5 bg-banner-halaman-products text-white">
        <div class="container py-5">
            <div class="row justify-content-center align-items-center">
                <div class="col-lg-8 text-center">
                    <h1 class="display-1 fw-bold mb-4">Products</h1>
                    <p class="lead mb-0">Explore our high-quality solutions tailored for your success.</p>
                </div>
            </div>
        </div>
    </section>
    <!--========== AKHIR AREA BANNER ==========-->

    <!--========== AREA FILTER PRODUCTS ==========-->
    <!-- PLACEHOLDER -->
    <!--========== AKHIR AREA FILTER PRODUCTS ==========-->

    <!--========== AREA KONTEN PRODUCTS ==========-->
    <div class="area-konten-halaman-products">
        <div class="container">
            <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 py-5">
                <?php if (!empty($productsData)) : ?>
                    <?php foreach ($productsData as $product) : ?>
                        <div class="col">
                            <div class="card h-100 shadow-lg-hover border-0 rounded-4 overflow-hidden transition-all">
                                <!-- Gambar produk -->
                                <div class="ratio ratio-1x1">
                                    <img src="<?php echo $baseUrl . $product['image']; ?>"
                                        class="card-img-top object-fit-cover"
                                        alt="<?php echo $product['name']; ?>">
                                </div>

                                <!-- Body card -->
                                <div class="card-body d-flex flex-column p-4">
                                    <!-- Nama produk -->
                                    <h5 class="card-title fs-5 fw-bold mb-2 text-truncate">
                                        <?php echo $product['name']; ?>
                                    </h5>

                                    <!-- Deskripsi produk -->
                                    <p class="card-text text-secondary mb-3 line-clamp-3">
                                        <?php echo $product['description']; ?>
                                    </p>

                                    <!-- Harga produk -->
                                    <div class="mt-auto pt-2">
                                        <p class="text-success fw-bold fs-5 mb-3">
                                            <?php echo $product['price']; ?>
                                        </p>
                                        <!-- Tombol aksi -->
                                        <a href="#" class="btn btn-primary w-100 rounded-3 py-2">
                                            View Details
                                            <i class="fas fa-arrow-right ms-2"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else : ?>
                    <!-- Tampilan kosong -->
                    <div class="col-12 text-center py-5">
                        <div class="py-5">
                            <i class="fas fa-box-open fa-4x text-light mb-4"></i>
                            <h3 class="h4 text-muted mb-3">No Products Available</h3>
                            <p class="text-muted">We're preparing something amazing for you!</p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <!--========== AKHIR AREA KONTEN PRODUCTS ==========-->

    <!--================ AREA FOOTER =================-->
    <?php include __DIR__ . '/../includes/footer.php'; ?>
    <!--================ AKHIR AREA FOOTER =================-->

    <!-- External JS libraries -->
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/jquery-slim.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/popper.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/slick.min.js"></script>
</body>

</html>