import Validator from 'fastest-validator';
import { hash as _hash, compare as _compare } from "bcrypt";
import { sign } from 'jsonwebtoken';
import { getDB } from '../../models/index.js';
const {  User, sequelize } = getDB();
import { promisify } from 'util';
//import { User } from '../../models';

const hash = promisify(_hash);  
const compare = promisify(_compare);

async function users_signup(req, res, next) {  
      try {  
        const { User } = getDB();  
        const existing = await User.findOne({ where: { email: req.body.email } });  
        if (existing) {  
          return res.status(409).json({ message: 'Email exists' });  
        }  
      
        const passwordHash = await hash(req.body.password, 10);  
        const newUser = {  
          userName: req.body.userName,  
          email: req.body.email,  
          password: passwordHash,  
        };  
      
        const created = await User.create(newUser);  
        // не возвращаем password  
        const responseUser = {  
          userId: created.userId,  
          userName: created.userName,  
          email: created.email,  
        };  
        return res.status(201).json({ message: 'User created', user: responseUser });  
      } catch (err) {  
+    console.error(err);  
        return res.status(500).json({ error: err });  
      }
    }  

async function users_login(req, res, next){
    const userLogin = User.findOne({where:{email: req.body.email}})
     .then(user => {
            if(user === null) {
                    return res.status(401).json({
                        message: 'Authorisation failed'
                    });
            }
            compare(req.body.password, user.password, (err, result) =>{
                if (err) {
                    return res.status(401).json({
                        message: 'Authorisation failed'
                    });
            }
                if (result) {
                    const token = sign({
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
      const deletedCount = await User.destroy({ where: { userId: id } });
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
      
     

    const updUser = User.update(updatedUser, {where: { userId: id }})
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

export default {
    users_signup,
    users_login,
    users_delete,
    users_modify_user
}