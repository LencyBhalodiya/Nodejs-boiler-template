import httpStatus from 'http-status';
import { asyncHandler } from '../utils/index.js';
import { userRegister, userlogin } from '../validation/auth.validation.js';
import { authService, userService, emailService } from '../services/index.js';

const register = asyncHandler(async (req, res) => {
  authService.isValid(userRegister, req);
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  authService.isValid(userlogin, req);
  const user = await authService.checkUserDetails(email, password);
  const tokens = await authService.generateAuthToken(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send('logout successfully');
});

const refreshTokens = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = await authService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export { register, login, logout, refreshTokens, forgotPassword, resetPassword };
