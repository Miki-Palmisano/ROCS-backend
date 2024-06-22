const express = require('express');
const { getFilmInfo } = require('../controllers/filmsController');

const router = express.Router();

router.get('/info/:filmId', getFilmInfo);

module.exports = router;