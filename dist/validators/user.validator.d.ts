import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    yearOfStudy: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        non_binary: "non_binary";
        prefer_not_to_say: "prefer_not_to_say";
    }>>;
    preferredGender: z.ZodOptional<z.ZodEnum<{
        male: "male";
        female: "female";
        any: "any";
    }>>;
}, z.core.$strip>;
export declare const updateInterestsSchema: z.ZodObject<{
    interests: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const addEmergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    phoneNumber: z.ZodString;
    relationship: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateEmergencyContactSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    relationship: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isPrimary: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export declare const blockUserSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const verifyPhoneSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
}, z.core.$strip>;
export declare const verifyPhoneOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const PREDEFINED_INTERESTS: readonly ["music", "sports", "coding", "reading", "travel", "photography", "gaming", "art", "food", "movies", "fitness", "dance", "cooking", "writing", "hiking", "yoga", "meditation", "podcasts", "anime", "tech", "startups", "finance", "fashion", "volunteering", "nature"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateInterestsInput = z.infer<typeof updateInterestsSchema>;
export type AddEmergencyContactInput = z.infer<typeof addEmergencyContactSchema>;
export type UpdateEmergencyContactInput = z.infer<typeof updateEmergencyContactSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type VerifyPhoneOtpInput = z.infer<typeof verifyPhoneOtpSchema>;
//# sourceMappingURL=user.validator.d.ts.map