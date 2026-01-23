import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';

function getReviewModel() {
  const db = getDB();
  if (!db || !db.Review) {
    throw new Error('Database not initialized. Review model not available.');
  }
  return db.Review;
}

async function reviews_get_all(req, res, next) {
  try {
    const { Review, Game, User } = getDB();
    const allReviews = await Review.findAll({
      include: [{
        model: Game,
        attributes: ['title']
      },
      {
        model: User,
        attributes: ['userName']
      }],
    });

    const response = {
      count: allReviews.length,
      reviews: allReviews.map(doc => {
        return {
          reviewTitle: doc.reviewTitle,
          reviewText: doc.reviewText,
          title: doc.Game ? doc.Game.title : null,
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
      error: err
    });
  }
}

async function reviews_get_user(req, res, next) {
  try {
    const { Review, Game, User } = getDB();
    const userId = req.params.userId;

    const userReviews = await Review.findAll({
      where: {
        userId: userId
      },
      include: [
        { model: Game },
        { model: User }
      ],
    });

    const response = {
      count: userReviews.length,
      reviews: userReviews.map(doc => {
        return {
          reviewTitle: doc.reviewTitle,
          reviewText: doc.reviewText,
          userName: doc.User ? doc.User.userName : null,
          title: doc.Game ? doc.Game.title : null,
          gameId: doc.gameId,
          userId: doc.userId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      })
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

async function reviews_get_game(req, res, next) {
  try {
    const { Review, Game, User } = getDB();
    const gameId = req.params.gameId;

    const gameReviews = await Review.findAll({
      where: {
        gameId: gameId
      },
      include: [
        { model: User },
        { model: Game }
      ]
    });

    const response = {
      count: gameReviews.length,
      reviews: gameReviews.map(doc => {
        return {
          reviewTitle: doc.reviewTitle,
          reviewText: doc.reviewText,
          userName: doc.User ? doc.User.userName : null,
          title: doc.Game ? doc.Game.title : null,
          gameId: doc.gameId,
          userId: doc.userId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      })
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

async function reviews_add_review(req, res, next) {
  try {
    const { Review } = getDB();
    const review = {
      reviewTitle: req.body.reviewTitle,
      reviewText: req.body.reviewText,
      userId: req.body.userId,
      gameId: req.body.gameId,
    };

    const schema = {
      reviewTitle: { type: "string", optional: false, max: '100' },
      reviewText: { type: "string", optional: false, max: '2000' },
      userId: { type: "number", optional: false },
      gameId: { type: "number", optional: false },
    };

    const v = new validator();
    const validationResponse = v.validate(review, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse
      });
    }

    const newReview = await Review.create(review);
    console.log(newReview);
    res.status(201).json({
      message: 'New review added successfully!',
      createdReview: {
        reviewTitle: newReview.reviewTitle,
        reviewText: newReview.reviewText,
        userId: newReview.userId,
        gameId: newReview.gameId,
        request: {
          type: 'POST',
          url: 'http://localhost:3000/reviews/' + newReview.reviewId
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

async function reviews_get_single(req, res, next) {
  try {
    const { Review, Game, User } = getDB();
    const id = req.params.reviewId;

    const singleReview = await Review.findByPk(id, {
      attributes: {
        exclude: ['updatedAt', 'createdAt'],
      },
      include: [
        { model: User },
        { model: Game }
      ]
    });

    console.log("From database", singleReview);
    if (singleReview) {
      res.status(200).json({
        userId: singleReview.userId,
        gameId: singleReview.gameId,
        userName: singleReview.User ? singleReview.User.userName : null,
        title: singleReview.Game ? singleReview.Game.title : null,
        reviewTitle: singleReview.reviewTitle,
        reviewText: singleReview.reviewText,
      });
    } else {
      res.status(404).json({ message: 'No valid data for id' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
}

async function reviews_modify_review(req, res, next) {
  try {
    const { Review } = getDB();
    const id = req.params.reviewId;
    const updatedReview = {
      reviewTitle: req.body.reviewTitle,
      reviewText: req.body.reviewText,
    };

    const schema = {
      reviewTitle: { type: "string", optional: false, max: '50' },
      reviewText: { type: "string", optional: false, max: '2000' },
    };

    const v = new validator();
    const validationResponse = v.validate(updatedReview, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse
      });
    }

    await Review.update(updatedReview, { where: { reviewId: id } });
    res.status(200).json({
      message: 'Review data updated!',
      request: {
        type: 'PATCH',
        url: 'http://localhost:3000/reviews/' + id
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

async function reviews_delete_review(req, res, next) {
  try {
    const { Review } = getDB();
    const id = req.params.reviewId;

    await Review.destroy({ where: { reviewId: id } });
    res.status(200).json({
      message: 'Review deleted!',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/reviews/',
        body: { reviewTitle: 'String(50)', reviewText: 'String(2000)', userId: 'number', gameId: 'number' }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

export {
  reviews_get_all,
  reviews_get_user,
  reviews_get_game,
  reviews_add_review,
  reviews_get_single,
  reviews_modify_review,
  reviews_delete_review
}