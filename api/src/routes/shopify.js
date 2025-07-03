const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopifyController');

// Test Shopify connection
router.get('/test', shopifyController.testConnection);

// Get orders from Shopify
router.get('/orders', shopifyController.getOrders);

// Get products for SKU mapping
router.get('/products', shopifyController.getProducts);

module.exports = router;
