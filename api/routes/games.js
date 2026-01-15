const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GameController = require('../controllers/games');

router.get('/', GameController.games_get_all);

router.post('/', checkAuth, GameController.games_add_game);

router.get('/:gameId', GameController.games_get_single);

router.patch('/:gameId', checkAuth, GameController.games_modify_game);

router.delete('/:gameId', checkAuth, GameController.games_delete_game);

module.exports = router;