const express = require('express');
const filmsController = require('../controllers/filmsController');

const router = express.Router();

router.get('/info/:filmsId', filmsController.getFilmInfo);
router.get('/search', filmsController.searchFilm)
router.get('/genres', filmsController.getFilmGenre)
router.get('/providers', filmsController.getProviders)
router.get('/', filmsController.getFilms)

module.exports = router;