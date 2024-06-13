const express = require('express');
const router = express.Router();
const { getAllSeries } = require('../controllers/seriesController');

router.get('/', getAllSeries);

module.exports = router;