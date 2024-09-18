const express = require('express');
const seriesController = require('../controllers/seriesController');

const router = express.Router();

router.get('/info/:seriesId', seriesController.getSerieInfo);
router.get('/search', seriesController.searchSerie)
router.get('/genres', seriesController.getSeriesGenre)
router.get('/providers', seriesController.getProviders)
router.get('/', seriesController.getSeries)

module.exports = router; 