const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'riverry';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

const shopifyAPI = {
  baseURL: `https://${SHOPIFY_STORE}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
};

const testConnection = async (req, res) => {
  try {
    if (!SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Shopify access token not configured'
      });
    }

    const response = await fetch(`${shopifyAPI.baseURL}/orders.json?limit=5&status=any`, {
      method: 'GET',
      headers: shopifyAPI.headers
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      message: `🎉 Connected to Shopify! Found ${data.orders.length} orders`,
      store: SHOPIFY_STORE,
      orders: data.orders.slice(0, 3).map(order => ({
        id: order.id,
        name: order.name,
        email: order.email,
        total_price: order.total_price,
        created_at: order.created_at,
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
    const limit = req.query.limit || 50;
    const response = await fetch(`${shopifyAPI.baseURL}/orders.json?limit=${limit}&status=any`, {
      method: 'GET',
      headers: shopifyAPI.headers
    });
    
    const data = await response.json();
    res.json({ success: true, orders: data.orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  testConnection,
  getOrders
};
