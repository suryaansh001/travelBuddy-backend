import { z } from 'zod';
export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes')
        .optional(),
    bio: z
        .string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
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
    preferredGender: z
        .enum(['male', 'female', 'any'])
        .optional(),
});
export const updateInterestsSchema = z.object({
    interests: z
        .array(z.string().min(1).max(50))
        .min(1, 'Select at least one interest')
        .max(10, 'Maximum 10 interests allowed'),
});
export const addEmergencyContactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long'),
    phoneNumber: z
        .string()
        .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    relationship: z
        .string()
        .max(50, 'Relationship description is too long')
        .optional(),
    isPrimary: z.boolean().optional().default(false),
});
export const updateEmergencyContactSchema = addEmergencyContactSchema.partial();
export const blockUserSchema = z.object({
    reason: z.string().max(500).optional(),
});
export const verifyPhoneSchema = z.object({
    phoneNumber: z
        .string()
        .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
});
export const verifyPhoneOtpSchema = z.object({
    phoneNumber: z
        .string()
        .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    otp: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers'),
});
// Predefined interests
export const PREDEFINED_INTERESTS = [
    'music', 'sports', 'coding', 'reading', 'travel', 'photography',
    'gaming', 'art', 'food', 'movies', 'fitness', 'dance', 'cooking',
    'writing', 'hiking', 'yoga', 'meditation', 'podcasts', 'anime',
    'tech', 'startups', 'finance', 'fashion', 'volunteering', 'nature',
];
//# sourceMappingURL=user.validator.js.map