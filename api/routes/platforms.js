import { Router } from 'express';
const router = Router();

import checkAuth from '../middleware/check-auth';

import { platforms_get_all, platforms_add_platform, platforms_get_single, platforms_modify_platform, platforms_delete_platform } from '../controllers/platforms';

router.get('/', platforms_get_all);

router.post('/', checkAuth, platforms_add_platform);

router.get('/:platformId', platforms_get_single);

router.patch('/:platformId', checkAuth, platforms_modify_platform);

router.delete('/:platformId', checkAuth, platforms_delete_platform);

export default router;