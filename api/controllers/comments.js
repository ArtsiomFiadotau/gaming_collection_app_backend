import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';

function getCommentModel() {
  const db = getDB();
  if (!db || !db.Comment) {
    throw new Error('Database not initialized. Comment model not available.');
  }
  return db.Comment;
}

async function comments_get_all(req, res, next) {
  try {
    const { Comment, Review, Game, User } = getDB();
    
    const allComments = await Comment.findAll({
      include: [
        {
          model: Review,
          attributes: ['reviewTitle'],
          include: [
            {
              model: Game,
              attributes: ['title']
            }
          ]
        },
        {
          model: User,
          attributes: ['userName']
        }
      ]
    });

    const response = {
      count: allComments.length,
      comments: allComments.map(doc => {
        return {
          commentText: doc.commentText,
          reviewTitle: doc.Review ? doc.Review.reviewTitle : null,
          title: doc.Review && doc.Review.Game ? doc.Review.Game.title : null,
          userName: doc.User ? doc.User.userName : null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      })
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_get_user(req, res, next) {
  try {
    const { Comment, Review, Game, User } = getDB();
    const userId = req.params.userId;
    
    const userComments = await Comment.findAll({
      where: {
        userId: userId
      },
      include: [
        {
          model: Review,
          attributes: ['reviewTitle'],
          include: [
            {
              model: Game,
              attributes: ['title']
            }
          ]
        }
      ]
    });

    const response = {
      count: userComments.length,
      comments: userComments.map(doc => {
        return {
          commentText: doc.commentText,
          reviewTitle: doc.Review ? doc.Review.reviewTitle : null,
          title: doc.Review && doc.Review.Game ? doc.Review.Game.title : null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      })
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_get_review(req, res, next) {
  try {
    const { Comment, Review, User } = getDB();
    const reviewId = req.params.reviewId;
    
    const reviewComments = await Comment.findAll({
      where: {
        reviewId: reviewId
      },
      include: [
        {
          model: User,
          attributes: ['userName']
        }
      ]
    });

    const response = {
      count: reviewComments.length,
      comments: reviewComments.map(doc => {
        return {
          commentId: doc.commentId,
          commentText: doc.commentText,
          userName: doc.User ? doc.User.userName : null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      })
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_add_comment(req, res, next) {
  try {
    const { Comment } = getDB();
    const comment = {
      commentText: req.body.commentText,
      userId: req.body.userId,
      reviewId: req.body.reviewId,
    };

    const schema = {
      commentText: { type: "string", optional: false, max: '1000' },
      userId: { type: "number", optional: false },
      reviewId: { type: "number", optional: false },
    };

    const v = new validator();
    const validationResponse = v.validate(comment, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse
      });
    }

    const newComment = await Comment.create(comment);
    console.log(newComment);
    
    res.status(201).json({
      message: 'New comment added successfully!',
      createdComment: {
        commentText: newComment.commentText,
        userId: newComment.userId,
        reviewId: newComment.reviewId,
        request: {
          type: 'POST',
          url: 'http://localhost:3000/comments/' + newComment.commentId
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_get_single(req, res, next) {
  try {
    const { Comment, Review, Game, User } = getDB();
    const id = req.params.commentId;
    
    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: Review,
          attributes: ['reviewTitle'],
          include: [
            {
              model: Game,
              attributes: ['title']
            }
          ]
        },
        {
          model: User,
          attributes: ['userName']
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const response = {
      commentId: comment.commentId,
      commentText: comment.commentText,
      reviewTitle: comment.Review ? comment.Review.reviewTitle : null,
      title: comment.Review && comment.Review.Game ? comment.Review.Game.title : null,
      userName: comment.User ? comment.User.userName : null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_modify_comment(req, res, next) {
  try {
    const { Comment } = getDB();
    const id = req.params.commentId;
    const updatedComment = {
      commentText: req.body.commentText,
    };

    const schema = {
      commentText: { type: "string", optional: true, max: '1000' },
    };

    const v = new validator();
    const validationResponse = v.validate(updatedComment, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse
      });
    }

    await Comment.update(updatedComment, { where: { commentId: id } });
    res.status(200).json({
      message: 'Comment data updated!',
      request: {
        type: 'PATCH',
        url: 'http://localhost:3000/comments/' + id
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

async function comments_delete_comment(req, res, next) {
  try {
    const { Comment } = getDB();
    const id = req.params.commentId;

    await Comment.destroy({ where: { commentId: id } });
    res.status(200).json({
      message: 'Comment deleted!',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/comments/',
        body: { commentText: 'String(1000)', userId: 'number', reviewId: 'number' }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || err
    });
  }
}

export {
  comments_get_all,
  comments_get_user,
  comments_get_review,
  comments_add_comment,
  comments_get_single,
  comments_modify_comment,
  comments_delete_comment
}