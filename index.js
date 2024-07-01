if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const { createProxyMiddleware } = require('http-proxy-middleware');
const collectionFilm = require('./routes/films')
const collectionSerie = require('./routes/series')
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

const app = express();

const services = {
    content: CONTENT_SERVICE_URL
}

const corsOptions = {
    origin: ALLOWED_ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [ "Content-Type", "Authorization", "Origin"],
}

app.use(cors(corsOptions));
app.use(express.json());

app.use('/content/films', collectionFilm)
app.use('/content/series', collectionSerie)

app.use('/content', createProxyMiddleware({ target: services.content, changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})