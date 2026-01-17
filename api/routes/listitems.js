import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth';

import { listitems_get_singlelist, listitems_add_listitem, listitems_delete_listitem } from '../controllers/listitems';

router.get('/:listId', listitems_get_singlelist);

router.post('/', checkAuth, listitems_add_listitem);

router.delete('/', checkAuth, listitems_delete_listitem);

export default router;