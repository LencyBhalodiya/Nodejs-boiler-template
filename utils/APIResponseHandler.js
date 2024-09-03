class ApiResponseHandler {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

/**
 * Send an email
 * @param {Obj} to
 * @param {number} statusCode
 * @param {string} data
 * @param {string} message
 * @returns {Promise}
 */
function ApiResponse(res, statusCode, data, message = "Success") {
    return res.status(statusCode).json(new ApiResponseHandler(statusCode, data, message))
}

export { ApiResponse }