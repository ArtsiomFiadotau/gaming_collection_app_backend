const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CollectionItemController = require('../controllers/collectionitems');

router.get('/:userId/:gameId/:platformId', CollectionItemController.collectionitems_get_collectionitem);

router.get('/:userId', CollectionItemController.collectionitems_get_usercollection);

router.post('/', checkAuth, CollectionItemController.collectionitems_add_collectionitem);

router.patch('/:userId/:gameId/:platformId', checkAuth, CollectionItemController.collectionitems_modify_collectionitem);

router.delete('/:userId/:gameId/:platformId', checkAuth, CollectionItemController.collectionitems_delete_collectionitem);

module.exports = router;