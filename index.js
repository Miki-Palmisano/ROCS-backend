if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const { createProxyMiddleware } = require('http-proxy-middleware');
const collectionFilm = require('./routes/films')
const collectionSerie = require('./routes/series')

const app = express();

const services = {
    content: CONTENT_SERVICE_URL
}

app.use(cors());
app.use(express.json());

app.use('/content/films', collectionFilm)
app.use('/content/series', collectionSerie)

app.use('/content', createProxyMiddleware({ target: services.content, changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})