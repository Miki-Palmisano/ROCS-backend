const express = require('express');
const user = require('../controllers/usersController');

const router = express.Router();

router.post('/auth', user.authUser);
router.post('/favorite', user.favourite);
router.get('/favorite/state', user.getFavoriteState);
router.post('/list', user.changeList);
router.get('/list/state', user.getListState);
router.get('/list', user.getList);
router.post('/list/remove', user.removeFromList);
router.post('/setProfileImage', user.setProfileImage);
router.get('/getProfileImage', user.getProfileImage);

module.exports = router;