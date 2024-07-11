const express = require('express');
const user = require('../controllers/usersController');
const { auth } = require('express-oauth2-jwt-bearer')

const router = express.Router();

const jwtCheck = auth({
    audience: 'rocs-certificate',
    issuerBaseURL: 'https://dev-z0fliml3r4ydfsg6.eu.auth0.com/',
    tokenSigningAlg: 'RS256'
});

router.post('/user/register',  user.registerUser);
router.post('/user/login', user.loginUser);
router.post('/user/auth', jwtCheck, user.authUser);

module.exports = router;