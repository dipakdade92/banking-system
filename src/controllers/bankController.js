const Bank = require('../models/Bank');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { generateToken } = require('../utils/jwtUtils');
const ResponseHandler = require('../utils/responseHandler');

class BankController {
    static async register(req, res) {
        try {
            const { name, bankCode, address, adminEmail, adminPassword } = req.body;

            const bank = await Bank.create({
                name,
                bankCode,
                address,
                adminEmail,
                adminPassword
            });

            const token = generateToken({ id: bank._id, type: 'bank' });

            return ResponseHandler.success(res, { bank, token }, 'Bank registered successfully', 201);
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }

    static async login(req, res) {
        try {
            const { adminEmail, adminPassword } = req.body;

            const bank = await Bank.findOne({ adminEmail });
            if (!bank) {
                return ResponseHandler.error(res, 'Invalid credentials', 401);
            }

            const isValidPassword = await bank.comparePassword(adminPassword);
            if (!isValidPassword) {
                return ResponseHandler.error(res, 'Invalid credentials', 401);
            }

            const token = generateToken({ id: bank._id, type: 'bank' });

            return ResponseHandler.success(res, { bank, token }, 'Login successful');
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }

    static async getAnalytics(req, res) {
        try {
            const bankId = req.bank._id;
            
            // Get total users for this bank
            const totalUsers = await User.countDocuments({ bankId });
            
            // Get total transactions for this bank
            const totalTransactions = await Transaction.countDocuments({
                $or: [{ senderBankId: bankId }, { receiverBankId: bankId }]
            });

            // Calculate total balance in all wallets for this bank
            const wallets = await Wallet.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        'user.bankId': bankId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: '$balance' }
                    }
                }
            ]);

            const totalBalance = wallets[0]?.totalBalance || 0;

            return ResponseHandler.success(res, {
                totalUsers,
                totalTransactions,
                totalBalance,
                bankId: bankId
            });
        } catch (error) {
            console.error('Analytics Error:', error);
            return ResponseHandler.error(res, error.message);
        }
    }
}

module.exports = BankController;