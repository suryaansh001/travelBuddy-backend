type MessageType = 'text' | 'image' | 'location' | 'payment' | 'system';
interface SendMessageData {
    type: MessageType;
    content?: string;
    imageUrl?: string;
    caption?: string;
    lat?: number;
    lng?: number;
    address?: string;
    paymentUrl?: string;
    amount?: number;
    upiId?: string;
}
declare class ChatService {
    getOrCreateChatRoom(tripId: string, userId: string): Promise<{
        id: string;
        tripId: string;
        isActive: boolean;
        trip: {
            id: string;
            origin: string;
            destination: string;
            departureDate: Date;
            departureTime: Date;
            status: import("@prisma/client").$Enums.TripStatus;
            creator: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            };
        };
        participants: ({
            role: "participant";
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
        } | {
            role: "creator";
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
        })[];
        lastMessage: {
            id: string;
            type: string;
            payload: import("@prisma/client/runtime/client").JsonValue;
            sender: {
                fullName: string;
            };
            createdAt: Date;
        } | null;
        createdAt: Date;
    }>;
    getChatParticipants(tripId: string): Promise<({
        role: "participant";
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
    } | {
        role: "creator";
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
    })[]>;
    sendMessage(roomId: string, userId: string, data: SendMessageData): Promise<{
        id: string;
        roomId: string;
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        sender: {
            id: string;
            fullName: string;
            profilePhotoUrl: string | null;
        };
        createdAt: Date;
        isDeleted: boolean;
        isFlagged: boolean;
    }>;
    getMessages(roomId: string, userId: string, options: {
        cursor?: string;
        limit: number;
    }): Promise<{
        messages: {
            id: string;
            roomId: string;
            type: string;
            payload: import("@prisma/client/runtime/client").JsonValue;
            sender: {
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            };
            createdAt: Date;
            isDeleted: boolean;
            isFlagged: boolean;
            isRead: any;
        }[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    markMessagesAsRead(roomId: string, userId: string, messageIds: string[]): Promise<{
        updatedCount: number;
    }>;
    getUnreadCount(roomId: string, userId: string): Promise<{
        unreadCount: number;
    }>;
    deleteMessage(roomId: string, messageId: string, userId: string): Promise<{
        message: string;
    }>;
    flagMessage(roomId: string, messageId: string, userId: string, reason: string): Promise<{
        message: string;
    }>;
    getMyChatRooms(userId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        chatRooms: ({
            id: string;
            tripId: string;
            isActive: boolean;
            trip: {
                id: string;
                origin: string;
                destination: string;
                departureDate: Date;
                departureTime: Date;
                status: import("@prisma/client").$Enums.TripStatus;
            };
            participants: ({
                role: "participant";
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            } | {
                role: "creator";
                id: string;
                fullName: string;
                profilePhotoUrl: string | null;
            })[];
            lastMessage: {
                id: string;
                type: string;
                payload: import("@prisma/client/runtime/client").JsonValue;
                sender: {
                    id: string;
                    fullName: string;
                };
                createdAt: Date;
            } | null;
            unreadCount: number;
            createdAt: Date;
        } | null)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    sendSystemMessage(roomId: string, content: string, eventType?: string, eventData?: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        roomId: string;
        senderId: string;
        messageType: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isDeleted: boolean;
        isFlagged: boolean;
    }>;
}
export declare const chatService: ChatService;
export {};
//# sourceMappingURL=chat.service.d.ts.map