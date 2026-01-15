const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const GameListController = require('../controllers/gamelists');

router.get('/', GameListController.gamelists_get_all);

router.get('/user/:userId', GameListController.gamelists_get_user);

router.post('/', checkAuth, GameListController.gamelists_add_gamelist);

router.get('/:listId', GameListController.gamelists_get_single);

router.patch('/:listId', checkAuth, GameListController.gamelists_modify_gamelist);

router.delete('/:listId', checkAuth, GameListController.gamelists_delete_gamelist);

module.exports = router;