const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const PlatformController = require('../controllers/platforms');

router.get('/', PlatformController.platforms_get_all);

router.post('/', checkAuth, PlatformController.platforms_add_platform);

router.get('/:platformId', PlatformController.platforms_get_single);

router.patch('/:platformId', checkAuth, PlatformController.platforms_modify_platform);

router.delete('/:platformId', checkAuth, PlatformController.platforms_delete_platform);

module.exports = router;