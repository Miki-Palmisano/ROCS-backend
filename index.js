if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const axios = require('axios')
const collectionFilm = require('./routes/films')
const collectionSerie = require('./routes/series')
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;

const app = express();

const services = {
    content: CONTENT_SERVICE_URL
}

const corsOptions = {
    origin: ALLOWED_ORIGINS,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}

app.use(cors(corsOptions));
app.use(express.json());

app.use('/content/films', collectionFilm)
app.use('/content/series', collectionSerie)

app.use('/content', (req, res) => {
    const url = `${CONTENT_SERVICE_URL}${req.originalUrl.replace('/content', '')}`;

    axios({
        method: req.method,
        url: url,
        data: req.data
    })
    .then(response => {
        res.json(response.data);
    })
    .catch(error => {
        console.error('Errore nel inoltrare la richiesta:', error);
        res.status(500).json({ error: 'Errore nel inoltrare la richiesta' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})