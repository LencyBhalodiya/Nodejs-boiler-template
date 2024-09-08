import httpStatus from 'http-status';
import { config } from '../config/config.js';
import { logger } from '../config/logger.js';
import { Token } from '../models/index.js';
import { AppError } from '../utils/index.js';
import { userService } from './index.js';

import jwt from 'jsonwebtoken';

/**
 * check invalid schema and throws error
 * @param {Object} schema
 * @returns {null}
 */
const isValid = (schema, req) => {
  const { error } = schema.validate(req.body);
  if (error?.details?.[0]?.message) throw new AppError(httpStatus.BAD_REQUEST, `${error.details[0].message}`);
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const checkUserDetails = async (email, password) => {
  const user = await userService.getUserByEmail(email, password);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, `Invalid Credientials`);
  }
  return user;
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {string} type
 * @param {string} [expiresIn]
 * @returns {string}
 */
const generateToken = (user, type, expiresIn) => {
  const payload = {
    id: user._id,
    email: user.email,
    roles: user.role,
    type,
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: expiresIn });
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.id,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthToken = async (user) => {
  try {
    const accessToken = generateToken(user, 'access', config.jwt.accessExpirationMinutes);
    const refreshToken = generateToken(user, 'refresh', config.jwt.refreshExpirationDays);
    await saveToken(refreshToken, user._id, 'refresh');
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(`Error in generateAuthToken: ${error.message}`);
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: 'refresh',
    blacklisted: false,
  });
  if (!refreshTokenDoc) throw new AppError(httpStatus.NOT_FOUND, 'Refresh Token Not found');
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, 'refresh');
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) throw new Error();

    await Token.findOneAndDelete({
      token: refreshToken,
      type: 'refresh',
      blacklisted: false,
    });
    return generateAuthToken(user);
  } catch (error) {
    logger.error(`Error at refreshAuth :: ${error.message}`);
    throw new AppError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await verifyToken(resetPasswordToken, 'resetPassword');
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: 'resetPassword' });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    logger.error(error.message);
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const resetPasswordToken = generateToken(user, 'resetPassword', config.jwt.resetPasswordExpirationMinutes);
  await saveToken(resetPasswordToken, user.id, 'resetPassword');
  return resetPasswordToken;
};

export { checkUserDetails, generateAuthToken, isValid, logout, refreshAuth, resetPassword, generateResetPasswordToken };
