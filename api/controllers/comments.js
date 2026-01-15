const validator = require('fastest-validator');
const models = require('../../models');
models.sequelize.sync();

async function comments_get_all(req, res, next){
    const allComments = models.Comment.findAll({
        attributes: {
          include: [models.User, models.Review],
          exclude: ['updatedAt', 'createdAt'],
        },
      })
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function comments_get_user(req, res, next){
    const userId = req.params.userId;
    const User = await models.Comment.findAll(
        {
            where: {
                userId: userId
            },
            include: [models.User, models.Review],
        })
    .then(docs => {
       const response = {
        count: docs.length,
        comments: docs.map(doc => {
            return {
                commentText: doc.commentText,
                reviewId: doc.reviewId,
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

async function comments_get_review(req, res, next){
    const reviewId = req.params.reviewId;
    const Review = await models.Review.findAll(
        {
            where: {
                reviewId: reviewId
            },
            include: [models.User, models.Review],
        })
    .then(docs => {
       const response = {
        count: docs.length,
        comments: docs.map(doc => {
            return {
                commentText: doc.commentText,
                userId: doc.userId,
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

async function comments_add_comment(req, res, next){
    const comment = {
        commentText: req.body.commentText,
        userId: req.body.userId,
        reviewId: req.body.reviewId,
    };

    const schema = {
        commentText: {type:"string", optional: false, max: '1000'},
        userId: {type:"number", optional: false},
        reviewId: {type:"number", optional: false},
    }
        
    const v = new validator();
    const validationResponse = v.validate(comment, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const newComment = models.Comment.create(comment).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New comment added succesfully!',
            createdComment: {
                commentText: result.commentText,
                userId: result.userId,
                reviewId: result.reviewId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/comments/' + result.commentId
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

async function comments_get_single(req, res, next){
    const id = req.params.commentId;
    const singleComment = models.Comment.findByPk(id, {
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
        },
      })
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
            res.status(200).json({
                comment: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/comments'
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

async function comments_modify_comment(req, res, next){
    const id = req.params.commentId;
    const updatedComment = {
        commentText: req.body.commentText,
        userId: req.body.userId,
        reviewId: req.body.reviewId,
    };
    
    const schema = {
        commentText: {type:"string", optional: false, max: '1000'},
        userId: {type:"number", optional: false},
        reviewId: {type:"number", optional: false},
    }
        
    const v = new validator();
    const validationResponse = v.validate(updatedComment, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const updComment = models.Comment.update(updatedComment, {where: { commentId: id }})
    .then(result => {
        res.status(200).json({
            message: 'comment data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/comments/' + id
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

async function comments_delete_comment(req, res, next){
    const id = req.params.commentId;
    const destroyComment = models.Comment.destroy({where:{commentId: id}})
    .then(result => {
        res.status(200).json({
            message: 'Comment deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/comments/',
                body: { commentText: 'String(1000)', userId: 'number', reviewId: 'number'}
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

module.exports = {
    comments_get_all,
    comments_get_user,
    comments_get_review,
    comments_add_comment,
    comments_get_single,
    comments_modify_comment,
    comments_delete_comment
}