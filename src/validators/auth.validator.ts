import { z } from 'zod';

// Approved college domains - JKLU is the primary supported domain
export const APPROVED_DOMAINS = [
  'jklu.edu.in', // JK Lakshmipat University - Primary
  'iitd.ac.in', 'iitb.ac.in', 'iitm.ac.in', 'iitk.ac.in', 'iitr.ac.in',
  'iitg.ac.in', 'iith.ac.in', 'iitp.ac.in', 'iitism.ac.in', 'iitbbs.ac.in',
  'iiitd.ac.in', 'iiith.ac.in', 'iiitb.ac.in', 'nsut.ac.in', 'dtu.ac.in',
  'bits-pilani.ac.in', 'nitt.edu', 'nitk.edu.in', 'nitw.ac.in',
  'edu', // Generic .edu domains
];

const isApprovedDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return APPROVED_DOMAINS.some(approved => 
    domain === approved || domain.endsWith(`.${approved}`)
  );
};

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(v => v.toLowerCase())
    .refine(isApprovedDomain, {
      message: 'Please use a valid college email address',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  collegeName: z
    .string()
    .min(2, 'College name is required')
    .max(255, 'College name is too long'),
  department: z
    .string()
    .max(100, 'Department name is too long')
    .optional(),
  yearOfStudy: z
    .number()
    .int()
    .min(1, 'Year must be between 1 and 5')
    .max(5, 'Year must be between 1 and 5')
    .optional(),
  gender: z
    .enum(['male', 'female', 'non_binary', 'prefer_not_to_say'])
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
