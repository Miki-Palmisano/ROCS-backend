const express = require('express');
const user = require('../controllers/usersController');
const { auth } = require('express-oauth2-jwt-bearer');
const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.clearCookie('token');
        res.clearCookie('username');
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

router.post('/register',  user.registerUser);
router.post('/login', user.loginUser);
router.post('/logout', user.logoutUser);
router.post('/auth', jwtCheck, user.authUser);
router.post('/favorite', jwtVerify, user.favorite);
router.get('/favorite/state', jwtVerify, user.getFavoriteState);
router.post('/list', jwtVerify, user.changeList);
router.get('/list/state', jwtVerify, user.getListState);
router.get('/list', jwtVerify, user.getList);
router.post('/list/remove', jwtVerify, user.removeFromList);

module.exports = router;