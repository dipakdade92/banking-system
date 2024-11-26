const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken, isBankAdmin } = require('../middleware/auth');
const { query } = require('express-validator');
const validate = require('../middleware/validator');

const router = express.Router();

const paginationValidation = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
];

router.get(
    '/users',
    authenticateToken,
    isBankAdmin,
    validate(paginationValidation),
    AdminController.getBankUsers
);
router.get(
    '/analytics',
    authenticateToken,
    isBankAdmin,
    AdminController.getGlobalAnalytics
);

module.exports = router;