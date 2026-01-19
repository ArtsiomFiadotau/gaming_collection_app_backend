import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { games_get_all, games_add_game, games_get_single, games_modify_game, games_delete_game } from '../controllers/games.js';

router.get('/', games_get_all);

router.post('/', checkAuth, games_add_game);

router.get('/:gameId', games_get_single);

router.patch('/:gameId', games_modify_game);

router.delete('/:gameId', games_delete_game);

export default router;