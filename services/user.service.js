import httpStatus from 'http-status';
import { AppError } from '../utils/index.js';
import { User } from '../models/index.js'

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    const user = await User.create(userBody);
    return user;
};


/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return User.findById(id);
};

export { createUser, getUserByEmail, getUserById };