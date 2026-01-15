const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CommentController = require('../controllers/comments');

router.get('/', CommentController.comments_get_all);

router.get('/review/:reviewId', CommentController.comments_get_review);

router.get('/user/:userId', CommentController.comments_get_user);

router.post('/', checkAuth, CommentController.comments_add_comment);

router.get('/:commentId', CommentController.comments_get_single);

router.patch('/:commentId', checkAuth, CommentController.comments_modify_comment);

router.delete('/:commentId', checkAuth, CommentController.comments_delete_comment);

module.exports = router;