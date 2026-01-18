import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { Review, Game, User, sequelize } = getDB();
//import { sequelize, Review as _Review, Game, User as _User } from '../../models';

async function reviews_get_all(req, res, next){
    const allReviews = Review.findAll({
            include: [{
                model: Game,
                attributes: ['title']
            },
            {
                model: User,
                attributes: ['userName']
            }],
          exclude: ['updatedAt', 'createdAt'],
        },
      )
    .then(docs => {
        const response = {
         count: docs.length,
         reviews: docs.map(doc => {
             return {
                 reviewTitle: doc.reviewTitle,
                 reviewText: doc.reviewText,
                 title: doc.Game ? doc.Game.title : null,
                 userName: doc.User ? doc.User.userName : null,
                 createdAt: doc.createdAt,
                 updatedAt: doc.updatedAt,
             }
         })
        };
         res.status(200).json(response);
     })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function reviews_get_user(req, res, next){
    const userId = req.params.userId;
    const User = await Review.findAll(
        {
            where: {
                userId: userId
            },
            include: [{
                model: Game,
                attributes: ['title']
            }],
        })
    .then(docs => {
       const response = {
        count: docs.length,
        reviews: docs.map(doc => {
            return {
                reviewTitle: doc.reviewTitle,
                reviewText: doc.reviewText,
                title: doc.Game ? doc.Game.title : null,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            }
        })
       };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function reviews_get_game(req, res, next){
    const gameId = req.params.gameId;
    const Review = await Review.findAll(
        {
            where: {
                gameId: gameId
            },
            include: [{
                                 model: User,
                                 attributes: ['userName']
                             }]
        })
    .then(docs => {
       const response = {
        count: docs.length,
        reviews: docs.map(doc => {
            return {
                reviewTitle: doc.reviewTitle,
                reviewText: doc.reviewText,
                userName: doc.User ? doc.User.userName : null,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            }
        })
       };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function reviews_add_review(req, res, next){
    const review = {
        reviewTitle: req.body.reviewTitle,
        reviewText: req.body.reviewText,
        userId: req.body.userId,
        gameId: req.body.gameId,
    };

    const schema = {
        reviewTitle: {type:"string", optional: false, max: '50'},
        reviewText: {type:"string", optional: false, max: '2000'},
        userId: {type:"number", optional: false},
        gameId: {type:"number", optional: false},
    }
        
    const v = new validator();
    const validationResponse = v.validate(review, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const newReview = Review.create(review).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New review added succesfully!',
            createdReview: {
                reviewTitle: result.reviewTitle,
                reviewText: result.reviewText,
                userId: result.userId,
                gameId: result.gameId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/reviews/' + result.reviewId
                }
            }
    });
})
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        });
    });
}

async function reviews_get_single(req, res, next){
    const id = req.params.reviewId;
    const singleReview = Review.findByPk(id, {
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
        },
      })
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
            res.status(200).json({
                review: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/reviews'
                }
            });
        } else {
            res.status(404).json({message: 'No valid data for id'});
        }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
    });
}

async function reviews_modify_review(req, res, next){
    const id = req.params.reviewId;
    const updatedReview = {
        reviewTitle: req.body.reviewTitle,
        reviewText: req.body.reviewText,
        // userId: req.body.userId,
        // gameId: req.body.gameId,
    };
    
    const schema = {
        reviewTitle: {type:"string", optional: false, max: '50'},
        reviewText: {type:"string", optional: false, max: '2000'},
        // userId: {type:"number", optional: false},
        // gameId: {type:"number", optional: false},
    }
        
    const v = new validator();
    const validationResponse = v.validate(updatedReview, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const updreview = Review.update(updatedReview, {where: { reviewId: id }})
    .then(result => {
        res.status(200).json({
            message: 'Review data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/reviews/' + id
            }
        });

    })
    .catch(err => {
        console.log(err);
        res.status(500),json({
            error: err
        });
    });
}

async function reviews_delete_review(req, res, next){
    const id = req.params.reviewId;
    const destroyReview = Review.destroy({where:{reviewId: id}})
    .then(result => {
        res.status(200).json({
            message: 'Review deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/reviews/',
                body: { reviewTitle: 'String(50)', reviewText: 'String(2000)', userId: 'number', gameId: 'number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

export default {
    reviews_get_all,
    reviews_get_user,
    reviews_get_game,
    reviews_add_review,
    reviews_get_single,
    reviews_modify_review,
    reviews_delete_review
}