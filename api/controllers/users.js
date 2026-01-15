const validator = require('fastest-validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const models = require('../../models');

async function users_signup(req, res, next){
    const userSignUp = models.User.findOne({where:{email: req.body.email}})
    .then(user => {
        if (user) {
            return res.status(409).json({
                message: 'Email existo'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = {
                        email: req.body.email,
                        password: hash
                    };
                    const createdUser = models.User
                    .create(user)
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            }); 
        }
    })
}

async function users_login(req, res, next){
    const userLogin = models.User.findOne({where:{email: req.body.email}})
     .then(user => {
            if(user === null) {
                    return res.status(401).json({
                        message: 'Authorisation failed'
                    });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) =>{
                if (err) {
                    return res.status(401).json({
                        message: 'Authorisation failed'
                    });
            }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.userId
                    }, 
                    process.env.JWT_KEY, 
                    {
                        expiresIn: "1h"    
                    }

                    );
                    return res.status(200).json({
                        message: 'Authorisation successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Authorisation failed'
                });
            });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
}

async function users_delete(req, res, next) {
    const id = req.params.userId;
    try {
      const deletedCount = await models.User.destroy({ where: { userId: id } });
      if (deletedCount > 0) {
        res.status(200).json({ message: 'User deleted' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

async function users_modify_user(req, res, next){
    const id = req.params.userId;
    const newPass = req.body.password;
    const updatedUser = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        avatarUrl: req.body.avatarUrl,
        gamesNumber: req.body.gamesNumber,
        gamesCompleted: req.body.gamesCompleted,
        ratingAverage: req.body.ratingAverage,
};


const schema = {
    userName: {type:"string", optional: true, max: '30'},
    email: {type:"string", optional: true},
    password: {type:"string", optional: true},
    avatarUrl: {type:"string", optional: true, max: '30'},
    gamesNumber: {type:"number", optional: true},
    gamesCompleted: {type:"number", optional: true},
    ratingAverage: {type:"number", optional: true},
}

    const v = new validator();
    const validationResponse = v.validate(updatedUser, schema);

        if(validationResponse !== true){
         return res.status(400).json({
             message: "Validation failed",
                errors: validationResponse
            });
     }
      
     

    const updUser = models.User.update(updatedUser, {where: { userId: id }})
    .then(result => {
        res.status(200).json({
            message: 'User data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/users/' + id
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

module.exports = {
    users_signup,
    users_login,
    users_delete,
    users_modify_user
}