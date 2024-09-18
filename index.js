if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

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
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/status', (req, res) => {
    res.status(200).json({ status: 'online' });
});

app.use('/films', collectionFilm)
app.use('/series', collectionSerie)
app.use('/users', collectionUser)
app.use('/all', collectionAll)

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});