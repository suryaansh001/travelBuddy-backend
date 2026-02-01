import { z } from 'zod';

// Report types
export const REPORT_TYPES = ['user', 'trip', 'chat_message'] as const;

// Report reasons
export const REPORT_REASONS = [
  'harassment',
  'inappropriate_content',
  'spam',
  'fake_profile',
  'safety_concern',
  'payment_issue',
  'no_show',
  'other',
] as const;

// Create a safety report
export const createReportSchema = z.object({
  type: z.enum(REPORT_TYPES),
  reportedUserId: z.string().uuid().optional(),
  reportedTripId: z.string().uuid().optional(),
  reportedMessageId: z.string().uuid().optional(),
  reason: z.enum(REPORT_REASONS),
  description: z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).default([]),
  isEmergency: z.boolean().default(false),
  emergencyLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    // At least one reported entity must be provided
    if (!data.reportedUserId && !data.reportedTripId && !data.reportedMessageId) {
      return false;
    }
    return true;
  },
  { message: 'At least one of reportedUserId, reportedTripId, or reportedMessageId is required' }
);

// Get my reports
export const getMyReportsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Block a user
export const blockUserSchema = z.object({
  blockedUserId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// Unblock a user
export const unblockUserSchema = z.object({
  blockedUserId: z.string().uuid(),
});

// Add emergency contact
export const addEmergencyContactSchema = z.object({
  name: z.string().min(1).max(100),
  phoneNumber: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number'),
  relationship: z.string().max(50).optional(),
  isPrimary: z.boolean().default(false),
});

// Update emergency contact
export const updateEmergencyContactSchema = z.object({
  contactId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number').optional(),
  relationship: z.string().max(50).optional(),
  isPrimary: z.boolean().optional(),
});

// Delete emergency contact
export const deleteEmergencyContactSchema = z.object({
  contactId: z.string().uuid(),
});

// Get blocked users
export const getBlockedUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Trigger SOS
export const triggerSOSSchema = z.object({
  tripId: z.string().uuid().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  message: z.string().max(500).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type AddEmergencyContactInput = z.infer<typeof addEmergencyContactSchema>;
export type UpdateEmergencyContactInput = z.infer<typeof updateEmergencyContactSchema>;
export type TriggerSOSInput = z.infer<typeof triggerSOSSchema>;
