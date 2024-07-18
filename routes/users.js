const express = require('express');
const user = require('../controllers/usersController');
const { auth } = require('express-oauth2-jwt-bearer');
const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token verification failed', error: err });
        }
        req.userId = decoded.id;
        next();
    });
};

const router = express.Router();

const jwtCheck = auth({
    audience: 'rocs-certificate',
    issuerBaseURL: 'https://dev-z0fliml3r4ydfsg6.eu.auth0.com/',
    tokenSigningAlg: 'RS256'
});

router.post('/user/register',  user.registerUser);
router.post('/user/login', user.loginUser);
router.post('/user/auth', jwtCheck, user.authUser);
router.post('/user/favorite', jwtVerify, user.favorite);
router.get('/user/favorite', jwtVerify, user.getFavoriteStatus);
router.post('/user/list', jwtVerify, user.changeList);
router.get('/user/list/state', jwtVerify, user.getListState);
router.get('/user/list', jwtVerify, user.getList);
router.post('/user/list/remove', jwtVerify, user.removeFromList);

module.exports = router;