const express = require('express');
const { body } = require('express-validator');
const BankController = require('../controllers/bankController');
const { authenticateToken, isBankAdmin } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

const bankValidation = [
    body('name').notEmpty().trim().withMessage('Bank name is required'),
    body('bankCode').notEmpty().trim().withMessage('Bank code is required'),
    body('address').notEmpty().trim().withMessage('Address is required'),
    body('adminEmail').isEmail().withMessage('Valid email is required'),
    body('adminPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('adminEmail').isEmail().withMessage('Valid email is required'),
    body('adminPassword').notEmpty().withMessage('Password is required')
];

router.post('/register', validate(bankValidation), BankController.register);
router.post('/login', validate(loginValidation), BankController.login);
router.get('/analytics', authenticateToken, isBankAdmin, BankController.getAnalytics);

module.exports = router;