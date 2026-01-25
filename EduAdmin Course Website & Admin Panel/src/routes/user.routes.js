const express = require('express');
const { userController } = require('../controllers');
const { validate, authenticate, isAdmin } = require('../middleware');
const { userValidation } = require('../validations');

const router = express.Router();

// All routes require admin access
router.use(authenticate, isAdmin);

router
  .route('/')
  .get(validate(userValidation.getUsers), userController.getUsers)
  .post(validate(userValidation.createUser), userController.createUser);

router.get('/statistics', userController.getStatistics);

router
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .patch(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
