const express = require('express');
const { getFilmInfo, getFilmGenreWithSearch } = require('../controllers/filmsController');

const router = express.Router();

router.get('/info/:filmId', getFilmInfo);

module.exports = router;