if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const collectionFilm = require('./routes/films')
const collectionSerie = require('./routes/series')
const collectionUser = require('./routes/users')
const collectionAll = require('./routes/all')

const app = express();
 
const corsOptions = {
    origin: ALLOWED_ORIGINS,
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());

const jwtCheck = auth({
    audience: 'rocs-certificate',
    issuerBaseURL: 'https://dev-z0fliml3r4ydfsg6.eu.auth0.com/',
    tokenSigningAlg: 'RS256'
});

app.use('/status', (req, res) => {
    res.status(200).json({ status: 'online' });
});

app.use('/films', collectionFilm)
app.use('/series', collectionSerie)
app.use('/users', jwtCheck, collectionUser)
app.use('/all', collectionAll)

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});