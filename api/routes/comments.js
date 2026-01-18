import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { comments_get_all, comments_get_review, comments_get_user, comments_add_comment, comments_get_single, comments_modify_comment, comments_delete_comment } from '../controllers/comments.js';

router.get('/', comments_get_all);

router.get('/review/:reviewId', comments_get_review);

router.get('/user/:userId', comments_get_user);

router.post('/', checkAuth, comments_add_comment);

router.get('/:commentId', comments_get_single);

router.patch('/:commentId', checkAuth, comments_modify_comment);

router.delete('/:commentId', checkAuth, comments_delete_comment);

export default router;