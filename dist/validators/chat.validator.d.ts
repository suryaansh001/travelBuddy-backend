import { z } from 'zod';
export declare const MESSAGE_TYPES: readonly ["text", "image", "location", "payment", "system"];
export declare const sendMessageSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        text: "text";
        image: "image";
        location: "location";
        payment: "payment";
        system: "system";
    }>>;
    content: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    address: z.ZodOptional<z.ZodString>;
    paymentUrl: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    upiId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const getMessagesSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const markReadSchema: z.ZodObject<{
    messageIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const deleteMessageSchema: z.ZodObject<{
    roomId: z.ZodString;
    messageId: z.ZodString;
}, z.core.$strip>;
export declare const flagMessageSchema: z.ZodObject<{
    roomId: z.ZodString;
    messageId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const getChatRoomSchema: z.ZodObject<{
    tripId: z.ZodString;
}, z.core.$strip>;
export declare const getMyChatRoomsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type FlagMessageInput = z.infer<typeof flagMessageSchema>;
export type GetChatRoomInput = z.infer<typeof getChatRoomSchema>;
export type GetMyChatRoomsInput = z.infer<typeof getMyChatRoomsSchema>;
//# sourceMappingURL=chat.validator.d.ts.map