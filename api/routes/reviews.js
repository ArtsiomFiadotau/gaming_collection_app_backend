const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ReviewController = require('../controllers/reviews');

router.get('/', ReviewController.reviews_get_all);

router.get('/game/:gameId', ReviewController.reviews_get_game);

router.get('/user/:userId', ReviewController.reviews_get_user);

router.post('/', checkAuth, ReviewController.reviews_add_review);

router.get('/:reviewId', ReviewController.reviews_get_single);

router.patch('/:reviewId', checkAuth, ReviewController.reviews_modify_review);

router.delete('/:reviewId', checkAuth, ReviewController.reviews_delete_review);

module.exports = router;