const { validationResult } = require('express-validator');
const ResponseHandler = require('../utils/responseHandler');

const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return ResponseHandler.error(
            res,
            'Validation error',
            400,
            errors.array()
        );
    };
};

module.exports = validate;