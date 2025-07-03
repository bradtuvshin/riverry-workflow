const express = require('express');
const router = express.Router();

// Fallback controller functions
const testConnection = async (req, res) => {
  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'riverry';
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Shopify access token not configured'
      });
    }

    const response = await fetch(`https://${SHOPIFY_STORE}.myshopify.com/admin/api/2024-10/orders.json?limit=3&status=any`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      message: `🎉 Connected to Shopify! Found ${data.orders.length} orders`,
      store: SHOPIFY_STORE,
      orders: data.orders.map(order => ({
        id: order.id,
        name: order.name,
        email: order.email,
        total_price: order.total_price,
        created_at: order.created_at,
        customer: order.customer,
        line_items: order.line_items.map(item => ({
          title: item.title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    });
  } catch (error) {
    console.error('❌ Shopify API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'riverry';
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const limit = req.query.limit || 50;
    
    const response = await fetch(`https://${SHOPIFY_STORE}.myshopify.com/admin/api/2024-10/orders.json?limit=${limit}&status=any`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json({ success: true, orders: data.orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Routes
router.get('/test', testConnection);
router.get('/orders', getOrders);

module.exports = router;
