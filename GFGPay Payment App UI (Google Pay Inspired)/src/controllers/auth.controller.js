const { authService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const register = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  ApiResponse.success(res, 201, 'Registration successful', { user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { phoneNumber, password } = req.body;
  const { user, tokens } = await authService.login(phoneNumber, password);
  ApiResponse.success(res, 200, 'Login successful', { user, tokens });
});

const loginWithEmail = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.loginWithEmail(email, password);
  ApiResponse.success(res, 200, 'Login successful', { user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  ApiResponse.success(res, 200, 'Tokens refreshed', { tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  ApiResponse.success(res, 200, 'Logged out successfully');
});

const getProfile = catchAsync(async (req, res) => {
  ApiResponse.success(res, 200, 'Profile retrieved', { user: req.user });
});

const setPin = catchAsync(async (req, res) => {
  await authService.setPin(req.user._id, req.body.pin);
  ApiResponse.success(res, 200, 'PIN set successfully');
});

const changePin = catchAsync(async (req, res) => {
  await authService.changePin(req.user._id, req.body.currentPin, req.body.newPin);
  ApiResponse.success(res, 200, 'PIN changed successfully');
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  ApiResponse.success(res, 200, 'Password changed successfully');
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.success(res, 200, 'Password reset email sent');
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success(res, 200, 'Password reset successfully');
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  ApiResponse.success(res, 200, 'Email verified successfully');
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  ApiResponse.success(res, 200, 'Verification email resent');
}); 

module.exports = {
  register,
  login,
  loginWithEmail,
  refreshTokens,
  logout,
  getProfile,
  setPin,
  changePin,
  changePassword,
};
