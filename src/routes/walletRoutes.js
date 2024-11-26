const express = require('express');
const { body, query } = require('express-validator');
const WalletController = require('../controllers/walletController');
const { authenticateToken, isUser } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

const transferValidation = [
    body('beneficiaryPhone').notEmpty().withMessage('Beneficiary phone number is required'),
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom(value => value > 0)
        .withMessage('Amount must be greater than 0'),
    body('description').optional().trim()
];

const transactionFilterValidation = [
    query('startDate').optional().isDate().withMessage('Invalid start date'),
    query('endDate').optional().isDate().withMessage('Invalid end date'),
    query('type').optional().isIn(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL']),
    query('minAmount').optional().isNumeric(),
    query('maxAmount').optional().isNumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
];

router.post(
    '/transfer',
    authenticateToken,
    isUser,
    validate(transferValidation),
    WalletController.sendMoney
);
router.get(
    '/transactions',
    authenticateToken,
    isUser,
    validate(transactionFilterValidation),
    WalletController.getTransactions
);
router.get(
    '/balance',
    authenticateToken,
    isUser,
    WalletController.getWalletBalance
);

module.exports = router;