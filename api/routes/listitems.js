const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ListItemController = require('../controllers/listitems');

router.get('/:listId', ListItemController.listitems_get_singlelist);

router.post('/', checkAuth, ListItemController.listitems_add_listitem);

router.delete('/', checkAuth, ListItemController.listitems_delete_listitem);

module.exports = router;