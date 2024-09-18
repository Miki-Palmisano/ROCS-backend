const express = require('express');
const allController = require('../controllers/allController');

const router = express.Router();

router.get('/popular', allController.getPopular)
router.get('/search', allController.search)

module.exports = router;