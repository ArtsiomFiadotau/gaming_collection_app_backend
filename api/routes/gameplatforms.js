const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GamePlatformController = require('../controllers/gameplatforms');

router.get('/platform/:platformId', GamePlatformController.gameplatforms_get_singleplatform);

router.get('/game/:gameId', GamePlatformController.gameplatforms_get_singlegame);

router.post('/', checkAuth, GamePlatformController.gameplatforms_add_gameplatform);

router.patch('/:gameId/:platformId', checkAuth, GamePlatformController.gameplatforms_modify_gameplatform);

router.delete('/:gameId/:platformId', checkAuth, GamePlatformController.gameplatforms_delete_gameplatform);

module.exports = router;