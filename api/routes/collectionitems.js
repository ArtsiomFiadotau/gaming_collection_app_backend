import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth';

import { collectionitems_get_collectionitem, collectionitems_get_usercollection, collectionitems_add_collectionitem, collectionitems_modify_collectionitem, collectionitems_delete_collectionitem } from '../controllers/collectionitems';

router.get('/:userId/:gameId/:platformId', collectionitems_get_collectionitem);

router.get('/:userId', collectionitems_get_usercollection);

router.post('/', checkAuth, collectionitems_add_collectionitem);

router.patch('/:userId/:gameId/:platformId', checkAuth, collectionitems_modify_collectionitem);

router.delete('/', checkAuth, collectionitems_delete_collectionitem);

export default router;