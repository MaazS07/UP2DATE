const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypal-controller.js');

router.post('/create-paypal-order', paypalController.createPayPalOrder);
router.post('/capture-paypal-order', paypalController.capturePayPalOrder);

module.exports = router;