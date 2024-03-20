var express = require('express');
var router = express.Router();

const usersController = require('../controllers/usersController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/member', usersController.member)

router.get('/member/new', usersController.memberform_get);

router.post('/member/new', usersController.memberform_post);

router.get('/admin', usersController.admin_get);

router.get('/admin/new', usersController.adminform_get);

router.post('/admin/new', usersController.adminform_post);

module.exports = router;
