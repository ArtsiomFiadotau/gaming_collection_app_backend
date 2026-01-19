import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { gamelists_get_all, gamelists_get_user, gamelists_add_gamelist, gamelists_get_single, gamelists_modify_gamelist, gamelists_delete_gamelist } from '../controllers/gamelists.js';

router.get('/', gamelists_get_all);

router.get('/user/:userId', gamelists_get_user);

router.post('/', gamelists_add_gamelist);

router.get('/:listId', gamelists_get_single);

router.patch('/:listId', gamelists_modify_gamelist);

router.delete('/:listId', gamelists_delete_gamelist);

export default router;