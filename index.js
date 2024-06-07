const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const collectionFilm = require('./routes/film')

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/film", collectionFilm)

app.listen(4000, () => {
    console.log("listening on port 4000")
})