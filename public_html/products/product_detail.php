<?php
// product_detail.php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/products/product_functions.php';
require_once __DIR__ . '/../../config/api/api_functions.php';

// Start session if not already started, from config.php
startSession();

// Load konfigurasi URL dinamis berdasarkan environment
$config = getEnvironmentConfig(); // Load dynamic URL configuration based on the environment, from config.php
$baseUrl = getBaseUrl($config, $_ENV['LIVE_URL']); // retrieves the appropriate base URL based on the environment, from config.php
$isLiveEnvironment = isLive(); // Check if the environment is live, from config.php
setCacheHeaders($isLiveEnvironment); // Set cache headers based on the environment, from config.php

$slug = $_GET['slug'] ?? null;

if (!$slug) {
    header("HTTP/1.0 404 Not Found");
    exit("Produk tidak ditemukan");
}

// Retrieves an active product information from the database based on the slug, function from api_functions.php
$productInfo = getActiveProductInfoBySlug($slug);

if (!$productInfo) {
    header("HTTP/1.0 404 Not Found");
    exit("Produk tidak ditemukan");
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($productInfo['product_name']) ?></title>
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>favicon.ico" />
    <!-- Bootstrap css -->
    <link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>assets/vendor/css/bootstrap.min.css" />
    <!-- Font Awesome -->
    <link rel="stylesheet" type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
    <!-- Custom CSS -->
    <link rel="stylesheet" type="text/css" href="<?php echo $baseUrl; ?>assets/css/styles.css" />

    <!-- Structured Data for SEO -->
    <?php if ($productInfo): ?>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "<?= htmlspecialchars($productInfo['product_name']) ?>",
                "description": "<?= htmlspecialchars(strip_tags($productInfo['description'])) ?>",
                "image": [
                    <?= implode(',', array_map(function ($image) use ($baseUrl) {
                        return '"' . $baseUrl . htmlspecialchars($image) . '"';
                    }, $productInfo['images'])) ?>
                ],
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "<?= $productInfo['price']['currency'] ?>",
                    "price": "<?= $productInfo['price']['amount'] ?>"
                }
            }
        </script>
    <?php endif; ?>
</head>

<body>
    <!--========== INSERT HEADER ==========-->
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <!--========== AKHIR INSERT HEADER ==========-->

    <!--========== AREA KONTEN DETAIL PRODUK ==========-->
    <div id="halamanDetailProduk-<?= htmlspecialchars($slug) ?>" class="container py-5 jarak-kustom">
        <div class="row g-5">
            <!-- Kolom Gambar -->
            <div class="col-lg-6">
                <div id="productCarousel-<?= htmlspecialchars($slug) ?>" class="carousel slide shadow-lg rounded-3" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        <?php foreach ($productInfo['images'] as $index => $image): ?>
                            <div class="carousel-item <?= $index === 0 ? 'active' : '' ?>">
                                <img src="<?= $baseUrl . htmlspecialchars($image) ?>"
                                    class="d-block w-100 img-fluid py-3 px-3"
                                    alt="<?= htmlspecialchars($productInfo['product_name']) ?>"
                                    style="max-height: 600px; object-fit: contain;">
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <?php if (count($productInfo['images']) > 1): ?>
                        <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Kolom Deskripsi -->
            <div class="col-lg-6">
                <div class="d-flex flex-column h-100">
                    <h1 id="productTitle-<?= htmlspecialchars($slug) ?>" class="display-5 fw-bold mb-3"><?= htmlspecialchars($productInfo['product_name']) ?></h1>

                    <div class="mb-4">
                        <span class="display-6 text-primary fw-bold">
                            <?= $productInfo['price']['currency'] ?>
                            <?= number_format($productInfo['price']['amount'], 0, ',', '.') ?>
                        </span>
                    </div>

                    <?php if (!empty($productInfo['categories'])): ?>
                        <div class="d-flex align-items-center mb-3">
                            <span class="me-2 text-secondary">Kategori:</span>
                            <div class="d-flex flex-wrap gap-2">
                                <?php foreach ($productInfo['categories'] as $category): ?>
                                    <span class="badge bg-primary bg-gradient text-white rounded-pill px-3">
                                        <?= htmlspecialchars($category) ?>
                                    </span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($productInfo['tags'])): ?>
                        <div class="d-flex align-items-center mb-4">
                            <span class="me-2 text-secondary">Tag:</span>
                            <div class="d-flex flex-wrap gap-2">
                                <?php foreach ($productInfo['tags'] as $tag): ?>
                                    <span class="badge bg-success bg-gradient text-white rounded-pill px-3">
                                        <?= htmlspecialchars($tag) ?>
                                    </span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <div class="card border-0 shadow-sm mb-4" id="productDescriptionCard-<?= htmlspecialchars($slug) ?>">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Deskripsi Produk</h5>
                            <div class="text-secondary lh-lg" id="productDescription-<?= htmlspecialchars($slug) ?>">
                                <?= nl2br(htmlspecialchars($productInfo['description'])) ?>
                            </div>
                        </div>
                    </div>

                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-2"></i>
                                Ditambahkan: <?= date('d M Y', strtotime($productInfo['created_at'])) ?>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--========== AKHIR AREA KONTEN DETAIL PRODUK ==========-->

    <!--========== AREA SCROLL TO TOP ==========-->
    <div class="scroll">
        <!-- Scroll to Top Button -->
        <a href="#" class="scroll-to-top" id="scrollToTopBtn">
            <i class="fa-solid fa-angles-up"></i>
        </a>
    </div>
    <!--========== AKHIR AREA SCROLL TO TOP ==========-->

    <!--================ AREA FOOTER =================-->
    <?php include __DIR__ . '/../includes/footer.php'; ?>
    <!--================ AKHIR AREA FOOTER =================-->

    <!-- External JS libraries -->
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/jquery-slim.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/popper.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/bootstrap.bundle.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/vendor/js/slick.min.js"></script>
    <script type="text/javascript" src="<?php echo $baseUrl; ?>assets/js/custom.js"></script>
    <script>
        // Tambahkan BASE_URL global
        const BASE_URL = '<?= $baseUrl ?>';
    </script>
</body>

</html>