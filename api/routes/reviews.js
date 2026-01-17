import { Router } from 'express';
const router = Router();
import checkAuth from '../middleware/check-auth';

import { reviews_get_all, reviews_get_game, reviews_get_user, reviews_add_review, reviews_get_single, reviews_modify_review, reviews_delete_review } from '../controllers/reviews';

router.get('/', reviews_get_all);

router.get('/game/:gameId', reviews_get_game);

router.get('/user/:userId', reviews_get_user);

router.post('/', checkAuth, reviews_add_review);

router.get('/:reviewId', reviews_get_single);

router.patch('/:reviewId', checkAuth, reviews_modify_review);

router.delete('/:reviewId', checkAuth, reviews_delete_review);

export default router;