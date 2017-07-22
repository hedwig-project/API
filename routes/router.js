'use strict';


/**
 * Expose routes
 */

module.exports = function (app) {
    app.use('/user', require('./users/usersRoutes')());
    app.use('/home', require('./home/homeRoutes')());

    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
                || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        console.error(err.stack);

        if (err.stack.includes('ValidationError')) {
            res.status(422);
            return;
        }
    });
};