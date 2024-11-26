const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken } = require('../utils/jwtUtils');
const ResponseHandler = require('../utils/responseHandler');

class UserController {
    static async register(req, res) {
        try {
            const { name, email, phoneNumber, password, initialDeposit } = req.body;
            const bankId = req.bank._id;

            const user = await User.create({
                name,
                email,
                phoneNumber,
                password,
                bankId
            });

            await Wallet.create({
                userId: user._id,
                balance: initialDeposit || 0
            });

            const token = generateToken({ id: user._id, type: 'user' });

            return ResponseHandler.success(res, { user, token }, 'User registered successfully', 201);
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }

    static async login(req, res) {
        try {
            const { email, phoneNumber, password } = req.body;

            const user = await User.findOne({
                $or: [{ email }, { phoneNumber }]
            });

            if (!user) {
                return ResponseHandler.error(res, 'Invalid credentials', 401);
            }

            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return ResponseHandler.error(res, 'Invalid credentials', 401);
            }

            const token = generateToken({ id: user._id, type: 'user' });

            return ResponseHandler.success(res, { user, token }, 'Login successful');
        } catch (error) {
            return ResponseHandler.error(res, error.message);
        }
    }
}

module.exports = UserController;