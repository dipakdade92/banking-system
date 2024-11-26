const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const { authenticateToken, isBankAdmin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

const userValidation = [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').notEmpty().trim().withMessage('Phone number is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('initialDeposit')
        .optional()
        .isNumeric()
        .withMessage('Initial deposit must be a number')
];

const loginValidation = [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post(
    '/register',
    authenticateToken,
    isBankAdmin,
    validate(userValidation),
    UserController.register
);
router.post('/login', validate(loginValidation), UserController.login);

module.exports = router;