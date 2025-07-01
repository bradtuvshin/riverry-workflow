const express = require('express');
const crypto = require('crypto');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET || 'default-secret')
    .update(body, 'utf8')
    .digest('base64');

  if (process.env.NODE_ENV === 'development' || hash === hmac) {
    next();
  } else {
    console.error('Shopify webhook verification failed');
    res.status(401).send('Unauthorized');
  }
};

router.post('/orders/create', verifyShopifyWebhook, async (req, res) => {
  try {
    const shopifyOrder = req.body;
    console.log('Processing new Shopify order:', shopifyOrder.order_number);

    let tasksCreated = 0;
    for (const item of shopifyOrder.line_items) {
      try {
        await createTaskFromLineItem(item, shopifyOrder);
        tasksCreated++;
      } catch (error) {
        console.error('Error creating task for item:', item.title, error);
      }
    }

    console.log(`Created ${tasksCreated} tasks for order ${shopifyOrder.order_number}`);

    res.status(200).json({ 
      success: true, 
      tasksCreated 
    });

  } catch (error) {
    console.error('Shopify webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

async function createTaskFromLineItem(lineItem, shopifyOrder) {
  const styleMapping = {
    'custom-portrait': 'portrait',
    'pet-painting': 'pet_portrait', 
    'family-portrait': 'family_portrait',
    'landscape-art': 'landscape',
    'abstract-art': 'abstract',
    'realistic-portrait': 'realistic',
    'cartoon-portrait': 'cartoon',
    'watercolor-painting': 'watercolor'
  };

  const payRates = {
    'portrait': 45,
    'pet_portrait': 40,
    'family_portrait': 65,
    'landscape': 35,
    'abstract': 30,
    'realistic': 55,
    'cartoon': 25,
    'watercolor': 40
  };

  const productType = lineItem.product_type?.toLowerCase() || 'custom-portrait';
  const paintingStyle = styleMapping[productType] || 'portrait';
  const basePayRate = payRates[paintingStyle] || 40;

  const daysToComplete = 7;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysToComplete);

  let priority = 'normal';
  if (lineItem.title.toLowerCase().includes('rush')) {
    priority = 'urgent';
  }

  const description = `${lineItem.title}\nQuantity: ${lineItem.quantity}\nShopify SKU: ${lineItem.sku}`;

  const task = new Task({
    sku: lineItem.sku || `SHOP-${lineItem.product_id}`,
    paintingStyle,
    title: lineItem.title,
    description,
    dueDate,
    payRate: basePayRate,
    priority,
    status: 'pending'
  });

  await task.save();
  return task;
}

router.get('/test', (req, res) => {
  res.json({ 
    message: 'Shopify integration is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
