const ResponseHandler = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return ResponseHandler.error(res, 'Validation Error', 400, err.errors);
    }

    if (err.name === 'MongoError' && err.code === 11000) {
        return ResponseHandler.error(res, 'Duplicate Entry', 400);
    }

    return ResponseHandler.error(
        res,
        'Internal Server Error',
        500,
        process.env.NODE_ENV === 'development' ? err.message : undefined
    );
};

module.exports = errorHandler;