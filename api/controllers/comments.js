const validator = require('fastest-validator');
const models = require('../../models');
models.sequelize.sync();

async function comments_get_all(req, res, next){
    const allComments = models.Comment.findAll({
            include: [
            {
                model: models.Review,
                attributes: ['reviewTitle'],
                include: [
                    {
                        model: models.Game,
                        attributes: ['title']
                    }
                ]
            },
            {
                model: models.User,
                attributes: ['userName']
            }]
        },
      )
    .then(docs => {
        const response = {
         count: docs.length,
         comments: docs.map(doc => {
             return {
                 commentText: doc.commentText,
                 reviewTitle: doc.Review ? doc.Review.reviewTitle : null,
                 title: doc.Review && doc.Review.Game ? doc.Review.Game.title : null,
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


async function comments_get_user(req, res, next){
    const userId = req.params.userId;
    const User = await models.Comment.findAll(
        {
            where: {
                userId: userId
            },
            include: [
                {
                    model: models.Review,
                    attributes: ['reviewTitle'],
                    include: [
                        {
                            model: models.Game,
                            attributes: ['title']
                        }
                    ]
                }
                ]
        })
    .then(docs => {
       const response = {
        count: docs.length,
        comments: docs.map(doc => {
            return {
                commentText: doc.commentText,
                reviewTitle: doc.Review ? doc.Review.reviewTitle : null,
                title: doc.Review && doc.Review.Game ? doc.Review.Game.title : null,
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
    const Comment = await models.Comment.findAll(
        {
            where: {
                reviewId: reviewId
            },
            include: [{
                model: models.User,
                attributes: ['userName']
            }],
        })
    .then(docs => {
       const response = {
        count: docs.length,
        comments: docs.map(doc => {
            return {
                commentText: doc.commentText,
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
    try {
        const comment = await models.Comment.findByPk(id, {
            include: [
                {
                    model: models.Review,
                    attributes: ['reviewTitle'],
                    include: [
                        {
                            model: models.Game,
                            attributes: ['title']
                        }
                    ]
                },
                {
                    model: models.User,
                    attributes: ['userName']
                }
            ]
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment не найден' });
        }

        const response = {
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
        res.status(500).json({ error: err.message });
    }
}

async function comments_modify_comment(req, res, next){
    const id = req.params.commentId;
    const updatedComment = {
        commentText: req.body.commentText,
        // userId: req.body.userId,
        // reviewId: req.body.reviewId,
    };
    
    const schema = {
        commentText: {type:"string", optional: true, max: '1000'},
        // userId: {type:"number", optional: true},
        // reviewId: {type:"number", optional: true},
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