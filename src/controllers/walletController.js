
// src/controllers/walletController.js
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');

class WalletController {
  static async sendMoney(req, res) {
    try {
        const { beneficiaryPhone, amount, description } = req.body;
        const senderId = req.user._id;

        // Validate sender and beneficiary
        const sender = await User.findById(senderId);
        const beneficiary = await User.findOne({ phoneNumber: beneficiaryPhone });

        if (!beneficiary) {
            return ResponseHandler.error(res, 'Beneficiary not found', 400);
        }

        // Get wallets
        const senderWallet = await Wallet.findOne({ userId: senderId });
        const beneficiaryWallet = await Wallet.findOne({ userId: beneficiary._id });

        if (!senderWallet || !beneficiaryWallet) {
            return ResponseHandler.error(res, 'Wallet not found', 400);
        }

        // Check balance
        if (senderWallet.balance < amount) {
            return ResponseHandler.error(res, 'Insufficient balance', 400);
        }

        // Check daily transaction limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyTransactions = await Transaction.aggregate([
            {
                $match: {
                    senderId: senderId,
                    createdAt: { $gte: today },
                    status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const dailyTotal = (dailyTransactions[0]?.totalAmount || 0) + amount;
        if (dailyTotal > sender.dailyTransactionLimit) {
            return ResponseHandler.error(res, 'Daily transaction limit exceeded', 400);
        }

        // Update sender's wallet
        const updatedSenderWallet = await Wallet.findByIdAndUpdate(
            senderWallet._id,
            { $inc: { balance: -amount } },
            { new: true }
        );

        // Update beneficiary's wallet
        const updatedBeneficiaryWallet = await Wallet.findByIdAndUpdate(
            beneficiaryWallet._id,
            { $inc: { balance: amount } },
            { new: true }
        );

        // Create transaction record
        const transaction = await Transaction.create({
            senderId: sender._id,
            receiverId: beneficiary._id,
            amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
            senderBankId: sender.bankId,
            receiverBankId: beneficiary.bankId,
            description
        });

        return ResponseHandler.success(
            res,
            {
                transaction,
                senderBalance: updatedSenderWallet.balance,
                beneficiaryBalance: updatedBeneficiaryWallet.balance
            },
            'Transfer successful'
        );

    } catch (error) {
        console.error('Transfer error:', error);
        return ResponseHandler.error(
            res,
            error.message || 'Transfer failed',
            400
        );
    }
}

static async getTransactions(req, res) {
    try {
        const userId = req.user._id;
        const { 
            startDate, 
            endDate, 
            type, 
            minAmount, 
            maxAmount,
            page = 1,
            limit = 10
        } = req.query;

        const query = {
            $or: [{ senderId: userId }, { receiverId: userId }]
        };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (type) {
            query.type = type;
        }

        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = Number(minAmount);
            if (maxAmount) query.amount.$lte = Number(maxAmount);
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(query)
            .populate('senderId', 'name email phoneNumber')
            .populate('receiverId', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Transaction.countDocuments(query);

        return ResponseHandler.success(res, {
            transactions,
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

static async getWalletBalance(req, res) {
    try {
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ userId });
        
        if (!wallet) {
            return ResponseHandler.error(res, 'Wallet not found', 404);
        }

        return ResponseHandler.success(res, { balance: wallet.balance });
    } catch (error) {
        return ResponseHandler.error(res, error.message);
    }
}
}

module.exports = WalletController;