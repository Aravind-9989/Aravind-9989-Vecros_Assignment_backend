const express = require('express');
const { user_register, user_login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', user_register);
router.post('/login', user_login);

module.exports = router;
