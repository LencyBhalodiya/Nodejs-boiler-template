class AppError extends Error {
    constructor(statusCode, message, errors = [], stack = '') {
        super(message)
        this.statusCode = statusCode;
        this.message = message || 'Not Found';
        this.success = false;
        this.errors = errors

        if (stack)
            this.stack = stack;
        else
            Error.captureStackTrace(this, this.constructor)
    }
}

export { AppError }