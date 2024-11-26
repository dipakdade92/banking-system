const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    bankCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    adminPassword: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

bankSchema.pre('save', async function(next) {
    if (this.isModified('adminPassword')) {
        this.adminPassword = await bcrypt.hash(this.adminPassword, 10);
    }
    next();
});

bankSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.adminPassword);
};

const Bank = mongoose.model('Bank', bankSchema);
module.exports = Bank;