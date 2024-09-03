import { AppError } from "../utils/index.js"
import { logger } from '../config/logger.js'
import httpStatus from "http-status";

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)
    
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ msg: error.message, errorCode: error.statusCode })
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Something went wrong");
}

export { errorHandler }