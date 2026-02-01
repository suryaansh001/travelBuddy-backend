import { z } from 'zod';
// Message types
export const MESSAGE_TYPES = ['text', 'image', 'location', 'payment', 'system'];
// 5.2 Send Message (body)
export const sendMessageSchema = z.object({
    type: z.enum(MESSAGE_TYPES).default('text'),
    content: z.string().max(2000, 'Message too long').optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    caption: z.string().max(500).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    address: z.string().max(500).optional(),
    paymentUrl: z.string().url().optional(),
    amount: z.number().positive().optional(),
    upiId: z.string().optional(),
}).refine((data) => {
    if (data.type === 'text')
        return !!data.content;
    if (data.type === 'image')
        return !!data.imageUrl;
    if (data.type === 'location')
        return data.lat !== undefined && data.lng !== undefined;
    if (data.type === 'payment')
        return !!data.paymentUrl && !!data.amount;
    return true;
}, { message: 'Missing required fields for message type' });
// 5.3 Get Messages (query params)
export const getMessagesSchema = z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
// 5.4 Mark Messages as Read (body)
export const markReadSchema = z.object({
    messageIds: z.array(z.string().uuid()).min(1).max(100),
});
// 5.8 Delete Message (route params)
export const deleteMessageSchema = z.object({
    roomId: z.string().uuid('Invalid room ID'),
    messageId: z.string().uuid('Invalid message ID'),
});
// 5.9 Flag Message (route params + body)
export const flagMessageSchema = z.object({
    roomId: z.string().uuid('Invalid room ID'),
    messageId: z.string().uuid('Invalid message ID'),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});
// Get Chat Room (route params)
export const getChatRoomSchema = z.object({
    tripId: z.string().uuid('Invalid trip ID'),
});
// Get My Chat Rooms (query params)
export const getMyChatRoomsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
//# sourceMappingURL=chat.validator.js.map