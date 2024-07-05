if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const collectionFilm = require('./routes/films')
const collectionSerie = require('./routes/series')
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');
const passport = require('passport');

const app = express();

const services = {
    content: process.env.CONTENT_SERVICE,
    database: process.env.DATABASE_SERVICE
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
    const url = `${services.content}${req.originalUrl.replace('/content', '')}`;

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

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    done(null, jwt_payload); // In a real app, you might want to fetch the user from the database
}));

app.use(passport.initialize());

const generateJWT = (user) => {
    const payload = {
        id: user.id,
        username: user.username
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

app.post('/database/user/register', async (req, res) => {
    try {
        const response = await axios.post(`${services.database}/user/register`, req.body);
        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

app.post('/database/user/login', async (req, res) => {
    try {
        const response = await axios.post(`${services.database}/user/login`, req.body);
        const user = response.data;
        const token = generateJWT(user);
        res.json({ token: token , username: user.username});
    } catch (error) {
        res.json(error);
    }
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('This is a protected route');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})