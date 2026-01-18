import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { Platform, sequelize } = getDB();
//import { sequelize, Platform } from '../../models';

async function platforms_get_all(req, res, next){
    const allPlatforms = Platform.findAll({
        attributes: {
          include: [],
          exclude: ['updatedAt', 'createdAt'],
        },
      })
    .then(docs => {
       const response = {
        count: docs.length,
        platforms: docs.map(doc => {
            return {
                platformName: doc.platformName,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/platforms/' + doc.platformId
                }
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

async function platforms_add_platform(req, res, next){
    const platform = {
        platformName: req.body.platformName,
    };

    const schema = {
        platformName: {type:"string", optional: false, max: '50'},
    }
        
    const v = new validator();
    const validationResponse = v.validate(platform, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const newPlatform = Platform.create(platform).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New platform added succesfully!',
            createdPlatform: {
                platformName: result.platformName,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/platforms/' + result.platformId
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

async function platforms_get_single(req, res, next){
    const id = req.params.platformId;
    const singlePlatform = Platform.findByPk(id, {
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
        },
      })
        .then(doc => {
            if (doc) {
            res.status(200).json({
                platform: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/platforms'
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
    
 async function platforms_modify_platform(req, res, next){
        const id = req.params.platformId;
        const updatedPlatform = {
            platformName: req.body.platformName,
};

const schema = {
    platformName: {type:"string", optional: false, max: '50'},
}
    
        const v = new validator();
        const validationResponse = v.validate(updatedPlatform, schema);
    
            if(validationResponse !== true){
             return res.status(400).json({
                 message: "Validation failed",
                    errors: validationResponse
                });
         }

        const updPlatform = Platform.update(updatedPlatform, {where: { platformId: id }})
        .then(result => {
            res.status(200).json({
                message: 'Platform data updated!',
                request: {
                    type: 'PATCH',
                    url: 'http://localhost:3000/platforms/' + id
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

async function platforms_delete_platform(req, res, next){
        const id = req.params.platformId;
        const delPlatform = Platform.destroy({where:{platformId: id}})
        .then(result => {
            res.status(200).json({
                message: 'Platform deleted!',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/platforms/',
                    body: { platformName: 'String'}
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

    export {
        platforms_get_all,
        platforms_add_platform,
        platforms_get_single,
        platforms_modify_platform,
        platforms_delete_platform
    }