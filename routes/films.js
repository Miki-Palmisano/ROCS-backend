const express = require('express')
const { getAllFilms } = require('../controllers/filmsController')

const router = express.Router()

router.get('/', getAllFilms)

module.exports = router