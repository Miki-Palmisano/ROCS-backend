const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const collectionFilms = require('./routes/films')
const collectionSeries = require('./routes/series')

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/film", collectionFilms)
app.use("/api/serie", collectionSeries)

app.listen(2000, () => {
    console.log("listening on port 2000")
})