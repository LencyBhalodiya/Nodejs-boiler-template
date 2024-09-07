import express from 'express'
import { register, login, logout, refreshTokens, forgotPassword, resetPassword } from "../controller/auth.controller.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshTokens);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

export default router;