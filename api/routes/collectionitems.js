import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { collectionitems_get_collectionitem, collectionitems_get_usercollection, collectionitems_add_collectionitem, collectionitems_modify_collectionitem, collectionitems_delete_collectionitem } from '../controllers/collectionitems.js';

router.get('/:userId/:gameId', collectionitems_get_collectionitem);

router.get('/:userId', collectionitems_get_usercollection);

router.post('/', collectionitems_add_collectionitem);

router.patch('/:userId/:gameId', collectionitems_modify_collectionitem);

router.delete('/', collectionitems_delete_collectionitem);

export default router;