import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
class ChatService {
    // 5.1 Get or Create Chat Room
    async getOrCreateChatRoom(tripId, userId) {
        // Verify user is participant or creator of trip
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                matches: {
                    where: { status: 'accepted' },
                    select: { matchedUserId: true },
                },
            },
        });
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
        const isCreator = trip.createdBy === userId;
        const isParticipant = trip.matches.some(m => m.matchedUserId === userId);
        if (!isCreator && !isParticipant) {
            throw new AppError('You are not a participant in this trip', 403);
        }
        // Common include for chat room queries
        const chatRoomInclude = {
            trip: {
                select: {
                    id: true,
                    originCity: true,
                    destinationCity: true,
                    departureDate: true,
                    departureTime: true,
                    status: true,
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePhotoUrl: true,
                        },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: { fullName: true },
                    },
                },
            },
        };
        // Get or create chat room
        let chatRoom = await prisma.chatRoom.findUnique({
            where: { tripId },
            include: chatRoomInclude,
        });
        if (!chatRoom) {
            chatRoom = await prisma.chatRoom.create({
                data: { tripId },
                include: chatRoomInclude,
            });
        }
        // Get participants
        const participants = await this.getChatParticipants(tripId);
        const lastMsg = chatRoom.messages[0];
        return {
            id: chatRoom.id,
            tripId: chatRoom.tripId,
            isActive: chatRoom.isActive,
            trip: {
                id: chatRoom.trip.id,
                origin: chatRoom.trip.originCity,
                destination: chatRoom.trip.destinationCity,
                departureDate: chatRoom.trip.departureDate,
                departureTime: chatRoom.trip.departureTime,
                status: chatRoom.trip.status,
                creator: chatRoom.trip.creator,
            },
            participants,
            lastMessage: lastMsg ? {
                id: lastMsg.id,
                type: lastMsg.messageType,
                payload: lastMsg.payload,
                sender: lastMsg.sender,
                createdAt: lastMsg.createdAt,
            } : null,
            createdAt: chatRoom.createdAt,
        };
    }
    // Get chat participants
    async getChatParticipants(tripId) {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                createdBy: true,
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
                matches: {
                    where: { status: 'accepted' },
                    select: {
                        matchedUser: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePhotoUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!trip)
            return [];
        const participants = [
            { ...trip.creator, role: 'creator' },
            ...trip.matches.map(m => ({ ...m.matchedUser, role: 'participant' })),
        ];
        return participants;
    }
    // 5.2 Send Message
    async sendMessage(roomId, userId, data) {
        // Verify room exists and user has access
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                trip: {
                    select: {
                        id: true,
                        createdBy: true,
                        status: true,
                        matches: {
                            where: { status: 'accepted' },
                            select: { matchedUserId: true },
                        },
                    },
                },
            },
        });
        if (!chatRoom) {
            throw new AppError('Chat room not found', 404);
        }
        if (!chatRoom.isActive) {
            throw new AppError('Chat room is archived', 403);
        }
        const isCreator = chatRoom.trip.createdBy === userId;
        const isParticipant = chatRoom.trip.matches.some(m => m.matchedUserId === userId);
        if (!isCreator && !isParticipant) {
            throw new AppError('You are not a participant in this chat', 403);
        }
        // Build payload based on message type
        let payload = { read_by: [userId] };
        switch (data.type) {
            case 'text':
                payload.content = data.content;
                break;
            case 'image':
                payload.image_url = data.imageUrl;
                payload.caption = data.caption || null;
                break;
            case 'location':
                payload.lat = data.lat;
                payload.lng = data.lng;
                payload.address = data.address || null;
                break;
            case 'payment':
                payload.payment_url = data.paymentUrl;
                payload.amount = data.amount;
                payload.upi_id = data.upiId || null;
                break;
            case 'system':
                payload.content = data.content;
                break;
        }
        const message = await prisma.chatMessage.create({
            data: {
                roomId,
                senderId: userId,
                messageType: data.type,
                payload,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
            },
        });
        return {
            id: message.id,
            roomId: message.roomId,
            type: message.messageType,
            payload: message.payload,
            sender: message.sender,
            createdAt: message.createdAt,
            isDeleted: message.isDeleted,
            isFlagged: message.isFlagged,
        };
    }
    // 5.3 Get Messages
    async getMessages(roomId, userId, options) {
        // Verify access
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                trip: {
                    select: {
                        createdBy: true,
                        matches: {
                            where: { status: 'accepted' },
                            select: { matchedUserId: true },
                        },
                    },
                },
            },
        });
        if (!chatRoom) {
            throw new AppError('Chat room not found', 404);
        }
        const isCreator = chatRoom.trip.createdBy === userId;
        const isParticipant = chatRoom.trip.matches.some(m => m.matchedUserId === userId);
        if (!isCreator && !isParticipant) {
            throw new AppError('You are not a participant in this chat', 403);
        }
        // Build query
        const where = { roomId };
        if (options.cursor) {
            const cursorMessage = await prisma.chatMessage.findUnique({
                where: { id: options.cursor },
                select: { createdAt: true },
            });
            if (cursorMessage) {
                where.createdAt = { lt: cursorMessage.createdAt };
            }
        }
        const messages = await prisma.chatMessage.findMany({
            where,
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: options.limit + 1, // Extra to check if more exist
        });
        const hasMore = messages.length > options.limit;
        const resultMessages = hasMore ? messages.slice(0, -1) : messages;
        return {
            messages: resultMessages.reverse().map(msg => ({
                id: msg.id,
                roomId: msg.roomId,
                type: msg.messageType,
                payload: msg.payload,
                sender: msg.sender,
                createdAt: msg.createdAt,
                isDeleted: msg.isDeleted,
                isFlagged: msg.isFlagged,
                isRead: Array.isArray(msg.payload?.read_by)
                    ? msg.payload.read_by.includes(userId)
                    : false,
            })),
            pagination: {
                hasMore,
                nextCursor: hasMore ? resultMessages[resultMessages.length - 1].id : null,
            },
        };
    }
    // 5.4 Mark Messages as Read
    async markMessagesAsRead(roomId, userId, messageIds) {
        // Verify access
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                trip: {
                    select: {
                        createdBy: true,
                        matches: {
                            where: { status: 'accepted' },
                            select: { matchedUserId: true },
                        },
                    },
                },
            },
        });
        if (!chatRoom) {
            throw new AppError('Chat room not found', 404);
        }
        const isCreator = chatRoom.trip.createdBy === userId;
        const isParticipant = chatRoom.trip.matches.some(m => m.matchedUserId === userId);
        if (!isCreator && !isParticipant) {
            throw new AppError('You are not a participant in this chat', 403);
        }
        // Update messages - add userId to read_by array using raw SQL for JSONB
        const result = await prisma.$executeRaw `
      UPDATE chat_messages 
      SET payload = jsonb_set(
        COALESCE(payload, '{}'),
        '{read_by}',
        COALESCE(payload->'read_by', '[]'::jsonb) || ${JSON.stringify([userId])}::jsonb
      )
      WHERE id = ANY(${messageIds}::uuid[])
      AND room_id = ${roomId}::uuid
      AND NOT (COALESCE(payload->'read_by', '[]'::jsonb) ? ${userId})
    `;
        return { updatedCount: result };
    }
    // 5.5 Get Unread Count
    async getUnreadCount(roomId, userId) {
        const count = await prisma.$queryRaw `
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE room_id = ${roomId}::uuid
      AND sender_id != ${userId}::uuid
      AND NOT (COALESCE(payload->'read_by', '[]'::jsonb) ? ${userId})
      AND is_deleted = false
    `;
        return { unreadCount: Number(count[0]?.count || 0) };
    }
    // 5.8 Delete Message (Soft Delete)
    async deleteMessage(roomId, messageId, userId) {
        const message = await prisma.chatMessage.findFirst({
            where: {
                id: messageId,
                roomId,
            },
        });
        if (!message) {
            throw new AppError('Message not found', 404);
        }
        if (message.senderId !== userId) {
            throw new AppError('You can only delete your own messages', 403);
        }
        // Check if within 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (message.createdAt < oneHourAgo) {
            throw new AppError('Messages can only be deleted within 1 hour of sending', 403);
        }
        await prisma.chatMessage.update({
            where: { id: messageId },
            data: { isDeleted: true },
        });
        return { message: 'Message deleted successfully' };
    }
    // 5.9 Flag Message
    async flagMessage(roomId, messageId, userId, reason) {
        const message = await prisma.chatMessage.findFirst({
            where: {
                id: messageId,
                roomId,
            },
            include: {
                sender: { select: { id: true } },
                room: {
                    include: {
                        trip: { select: { id: true } },
                    },
                },
            },
        });
        if (!message) {
            throw new AppError('Message not found', 404);
        }
        // Update message as flagged
        await prisma.chatMessage.update({
            where: { id: messageId },
            data: { isFlagged: true },
        });
        // Create safety report
        await prisma.safetyReport.create({
            data: {
                reporterId: userId,
                reportedUserId: message.senderId,
                type: 'chat_message',
                reason,
                description: `Flagged chat message: "${message.payload?.content || 'Non-text message'}"`,
                status: 'pending',
            },
        });
        return { message: 'Message flagged for review' };
    }
    // Get My Chat Rooms
    async getMyChatRooms(userId, options) {
        // Get trips where user is creator or accepted participant
        const trips = await prisma.trip.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    {
                        matches: {
                            some: {
                                matchedUserId: userId,
                                status: 'accepted',
                            },
                        },
                    },
                ],
                chatRoom: { isNot: null },
            },
            include: {
                chatRoom: {
                    include: {
                        messages: {
                            take: 1,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePhotoUrl: true,
                    },
                },
                matches: {
                    where: { status: 'accepted' },
                    select: {
                        matchedUser: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePhotoUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { departureDate: 'desc' },
            skip: (options.page - 1) * options.limit,
            take: options.limit,
        });
        const total = await prisma.trip.count({
            where: {
                OR: [
                    { createdBy: userId },
                    {
                        matches: {
                            some: {
                                matchedUserId: userId,
                                status: 'accepted',
                            },
                        },
                    },
                ],
                chatRoom: { isNot: null },
            },
        });
        // Get unread counts for each room
        const chatRooms = await Promise.all(trips.map(async (trip) => {
            if (!trip.chatRoom)
                return null;
            const unreadResult = await this.getUnreadCount(trip.chatRoom.id, userId);
            return {
                id: trip.chatRoom.id,
                tripId: trip.id,
                isActive: trip.chatRoom.isActive,
                trip: {
                    id: trip.id,
                    origin: trip.originCity,
                    destination: trip.destinationCity,
                    departureDate: trip.departureDate,
                    departureTime: trip.departureTime,
                    status: trip.status,
                },
                participants: [
                    { ...trip.creator, role: 'creator' },
                    ...trip.matches.map(m => ({ ...m.matchedUser, role: 'participant' })),
                ],
                lastMessage: trip.chatRoom.messages[0] ? {
                    id: trip.chatRoom.messages[0].id,
                    type: trip.chatRoom.messages[0].messageType,
                    payload: trip.chatRoom.messages[0].payload,
                    sender: trip.chatRoom.messages[0].sender,
                    createdAt: trip.chatRoom.messages[0].createdAt,
                } : null,
                unreadCount: unreadResult.unreadCount,
                createdAt: trip.chatRoom.createdAt,
            };
        }));
        return {
            chatRooms: chatRooms.filter(Boolean),
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                totalPages: Math.ceil(total / options.limit),
            },
        };
    }
    // Send System Message (for automated notifications)
    async sendSystemMessage(roomId, content, eventType, eventData) {
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: roomId },
        });
        if (!chatRoom) {
            throw new AppError('Chat room not found', 404);
        }
        const message = await prisma.chatMessage.create({
            data: {
                roomId,
                senderId: null, // System messages have no sender
                messageType: 'system',
                payload: {
                    content,
                    event_type: eventType || 'info',
                    event_data: eventData || {},
                    read_by: [],
                },
            },
        });
        return message;
    }
}
export const chatService = new ChatService();
//# sourceMappingURL=chat.service.js.map