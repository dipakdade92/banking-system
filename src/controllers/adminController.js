const Bank = require('../models/Bank');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const ResponseHandler = require('../utils/responseHandler');

class AdminController {
    static async getBankUsers(req, res) {
        try {
            const bankId = req.bank._id;
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;

            const users = await User.aggregate([
                { $match: { bankId: bankId } },
                {
                    $lookup: {
                        from: 'wallets',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'wallet'
                    }
                },
                {
                    $lookup: {
                        from: 'transactions',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            { $eq: ['$senderId', '$$userId'] },
                                            { $eq: ['$receiverId', '$$userId'] }
                                        ]
                                    }
                                }
                            },
                            {
                                $count: 'total'
                            }
                        ],
                        as: 'transactionCount'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        phoneNumber: 1,
                        createdAt: 1,
                        walletBalance: { $arrayElemAt: ['$wallet.balance', 0] },
                        transactionCount: { $arrayElemAt: ['$transactionCount.total', 0] }
                    }
                }
            ])
            .skip(skip)
            .limit(Number(limit));

            const total = await User.countDocuments({ bankId });

            return ResponseHandler.success(res, {
                users,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / limit),
                    totalRecords: total
                }
            });
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }

    static async getGlobalAnalytics(req, res) {
        try {
            const totalBanks = await Bank.countDocuments();
            const totalUsers = await User.countDocuments();
            
            const totalTransactions = await Transaction.aggregate([
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);

            const totalBalance = await Wallet.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: '$balance' }
                    }
                }
            ]);

            return ResponseHandler.success(res, {
                totalBanks,
                totalUsers,
                transactionCount: totalTransactions[0]?.count || 0,
                totalTransactionAmount: totalTransactions[0]?.totalAmount || 0,
                totalMoneyInCirculation: totalBalance[0]?.totalBalance || 0
            });
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }
}

module.exports = AdminController;