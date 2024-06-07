const express = require('express')
const { getAllFilms } = require('../controllers/filmController')

const router = express.Router()

router.get('/', getAllFilms)

module.exports = router