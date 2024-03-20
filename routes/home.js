const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');

router.get('/', homeController.homepage);

router.get('/create', homeController.messages_get);

router.post('/create', homeController.messages_post);

module.exports = router;