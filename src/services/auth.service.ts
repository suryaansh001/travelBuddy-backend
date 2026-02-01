import { prisma } from '../config/database.js';
import { redis, REDIS_KEYS, REDIS_TTL } from '../config/redis.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getTokenExpiration } from '../utils/jwt.js';
import { generateOTP, generateToken } from '../utils/crypto.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  // 1.1 User Registration
  async register(input: RegisterInput) {
    const { email, password, fullName, collegeName, department, yearOfStudy, gender } = input;
    
    // Extract domain from email
    const collegeDomain = email.split('@')[1];
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        collegeName,
        collegeDomain,
        department,
        yearOfStudy,
        gender,
        trustScore: 5.0,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        collegeDomain: true,
        department: true,
        yearOfStudy: true,
        gender: true,
        emailVerified: true,
        trustScore: true,
        createdAt: true,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    await redis.setEx(REDIS_KEYS.OTP_EMAIL(email), REDIS_TTL.OTP, otp);
    await sendVerificationEmail(email, otp, fullName);

    // Generate tokens (limited access until verified)
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isVerified: false,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: 1,
    });

    // Store refresh token
    await redis.setEx(
      REDIS_KEYS.REFRESH_TOKEN(user.id),
      REDIS_TTL.REFRESH_TOKEN,
      refreshToken
    );

    return {
      user,
      accessToken,
      refreshToken,
      message: 'Registration successful. Please verify your email.',
    };
  }

  // 1.2 Email Verification (OTP)
  async verifyEmail(email: string, otp: string) {
    // Get stored OTP
    const storedOtp = await redis.get(REDIS_KEYS.OTP_EMAIL(email));
    
    if (!storedOtp) {
      throw new AppError('OTP expired or not found. Please request a new one.', 400);
    }

    if (storedOtp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // Update user
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
      },
    });

    // Delete OTP
    await redis.del(REDIS_KEYS.OTP_EMAIL(email));
    await redis.del(REDIS_KEYS.OTP_RESEND_COUNT(email));

    // Generate new access token with verified status
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isVerified: true,
    });

    return {
      user,
      accessToken,
      message: 'Email verified successfully',
    };
  }

  // 1.2 Resend OTP
  async resendOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, emailVerified: true },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Check resend limit (max 3 per hour)
    const resendKey = REDIS_KEYS.OTP_RESEND_COUNT(email);
    const resendCount = await redis.incr(resendKey);
    
    if (resendCount === 1) {
      await redis.expire(resendKey, REDIS_TTL.RATE_LIMIT_WINDOW);
    }

    if (resendCount > 3) {
      throw new AppError('Too many OTP requests. Please try again later.', 429);
    }

    // Generate and send new OTP
    const otp = generateOTP();
    await redis.setEx(REDIS_KEYS.OTP_EMAIL(email), REDIS_TTL.OTP, otp);
    await sendVerificationEmail(email, otp, user.fullName);

    return { message: 'Verification code sent to your email' };
  }

  // 1.4 Login
  async login(input: LoginInput) {
    const { email, password } = input;

    // Check login attempts
    const attemptsKey = REDIS_KEYS.LOGIN_ATTEMPTS(email);
    const attempts = await redis.get(attemptsKey);
    
    if (attempts && parseInt(attempts) >= 5) {
      const ttl = await redis.ttl(attemptsKey);
      throw new AppError(
        `Account locked due to too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
        429
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        interests: true,
      },
    });

    if (!user) {
      await this.incrementLoginAttempts(email);
      throw new AppError('Invalid email or password', 401);
    }

    // Check if blocked
    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Please contact support.', 403);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      await this.incrementLoginAttempts(email);
      throw new AppError('Invalid email or password', 401);
    }

    // Clear login attempts on success
    await redis.del(attemptsKey);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isVerified: user.emailVerified,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: 1,
    });

    // Store refresh token
    await redis.setEx(
      REDIS_KEYS.REFRESH_TOKEN(user.id),
      REDIS_TTL.REFRESH_TOKEN,
      refreshToken
    );

    // Exclude sensitive fields
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  private async incrementLoginAttempts(email: string) {
    const key = REDIS_KEYS.LOGIN_ATTEMPTS(email);
    const attempts = await redis.incr(key);
    if (attempts === 1) {
      await redis.expire(key, REDIS_TTL.LOGIN_LOCKOUT);
    }
  }

  // 1.5 Logout
  async logout(token: string, userId: string) {
    // Add token to blacklist
    const expiration = getTokenExpiration(token);
    if (expiration) {
      const ttl = expiration - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setEx(REDIS_KEYS.BLACKLIST(token), ttl, '1');
      }
    }

    // Delete refresh token
    await redis.del(REDIS_KEYS.REFRESH_TOKEN(userId));

    return { message: 'Logged out successfully' };
  }

  // 1.6 Token Refresh
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(REDIS_KEYS.REFRESH_TOKEN(payload.userId));
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Refresh token not found or expired', 401);
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        isBlocked: true,
        isActive: true,
      },
    });

    if (!user || user.isBlocked || !user.isActive) {
      await redis.del(REDIS_KEYS.REFRESH_TOKEN(payload.userId));
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      isVerified: user.emailVerified,
    });

    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: payload.tokenVersion + 1,
    });

    await redis.setEx(
      REDIS_KEYS.REFRESH_TOKEN(user.id),
      REDIS_TTL.REFRESH_TOKEN,
      newRefreshToken
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // 1.7 Forgot Password
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Invalidate any existing reset tokens
    const existingTokens = await redis.keys(`reset:*`);
    for (const key of existingTokens) {
      const userId = await redis.get(key);
      if (userId === user.id) {
        await redis.del(key);
      }
    }

    // Generate reset token
    const resetToken = generateToken();
    await redis.setEx(REDIS_KEYS.RESET_TOKEN(resetToken), REDIS_TTL.RESET_TOKEN, user.id);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.fullName);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  // 1.8 Reset Password
  async resetPassword(token: string, newPassword: string) {
    // Get user ID from token
    const userId = await redis.get(REDIS_KEYS.RESET_TOKEN(token));
    
    if (!userId) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Delete reset token
    await redis.del(REDIS_KEYS.RESET_TOKEN(token));

    // Invalidate all refresh tokens (log out all devices)
    await redis.del(REDIS_KEYS.REFRESH_TOKEN(userId));

    return { message: 'Password reset successfully. Please login with your new password.' };
  }

  // 1.9 Change Password (Authenticated)
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Check if new password is same as old
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400);
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        fullName: true,
        profilePhotoUrl: true,
        collegeName: true,
        collegeDomain: true,
        department: true,
        yearOfStudy: true,
        phoneNumber: true,
        phoneVerified: true,
        bio: true,
        gender: true,
        preferredGender: true,
        trustScore: true,
        totalTripsCompleted: true,
        totalTripsCancelled: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        interests: {
          select: { interest: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      ...user,
      interests: user.interests.map(i => i.interest),
    };
  }
}

export const authService = new AuthService();
