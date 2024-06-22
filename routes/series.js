const express = require('express');
const { getFilmInfo } = require('../controllers/seriesController');

const router = express.Router();

router.get('/info/:serieId', getFilmInfo);

module.exports = router;