const express = require('express');
const { getSerieInfo } = require('../controllers/seriesController');

const router = express.Router();

router.get('/info/:serieId', getSerieInfo);

module.exports = router;