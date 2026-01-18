import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { gameplatforms_get_singleplatform, gameplatforms_get_singlegame, gameplatforms_add_gameplatform, gameplatforms_modify_gameplatform, gameplatforms_delete_gameplatform } from '../controllers/gameplatforms.js';

router.get('/platform/:platformId', gameplatforms_get_singleplatform);

router.get('/game/:gameId', gameplatforms_get_singlegame);

router.post('/', checkAuth, gameplatforms_add_gameplatform);

router.patch('/:gameId/:platformId', checkAuth, gameplatforms_modify_gameplatform);

router.delete('/:gameId/:platformId', checkAuth, gameplatforms_delete_gameplatform);

export default router;