const { verifyToken } = require('../utils/jwtUtils');
const ResponseHandler = require('../utils/responseHandler');
const User = require('../models/User');
const Bank = require('../models/Bank');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ResponseHandler.error(res, 'Authorization token required', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (decoded.type === 'user') {
            const user = await User.findById(decoded.id);
            if (!user) {
                return ResponseHandler.error(res, 'User not found', 401);
            }
            req.user = user;
        } else if (decoded.type === 'bank') {
            const bank = await Bank.findById(decoded.id);
            if (!bank) {
                return ResponseHandler.error(res, 'Bank not found', 401);
            }
            req.bank = bank;
        }

        next();
    } catch (error) {
        return ResponseHandler.error(res, 'Invalid token', 401);
    }
};

const isBankAdmin = (req, res, next) => {
    if (!req.bank) {
        return ResponseHandler.error(res, 'Access denied. Bank admin only.', 403);
    }
    next();
};

const isUser = (req, res, next) => {
    if (!req.user) {
        return ResponseHandler.error(res, 'Access denied. User only.', 403);
    }
    next();
};

module.exports = {
    authenticateToken,
    isBankAdmin,
    isUser
};