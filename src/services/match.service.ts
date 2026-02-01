import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class MatchService {
  // 4.6 Accept Match
  async acceptMatch(userId: string, matchId: string, seatsRequested: number) {
    // Get match with trip info
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        trip: {
          select: {
            id: true,
            createdBy: true,
            availableSeats: true,
            totalSeats: true,
            originCity: true,
            destinationCity: true,
            farePerPerson: true,
            status: true,
          },
        },
        tripCreator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Verify user is the matched user
    if (match.matchedUserId !== userId) {
      throw new AppError('You are not authorized to accept this match', 403);
    }

    // Check match is pending
    if (match.status !== 'pending') {
      throw new AppError(`Match is already ${match.status}`, 400);
    }

    // Check trip is still open
    if (match.trip.status !== 'open') {
      throw new AppError('Trip is no longer accepting participants', 400);
    }

    // Check available seats
    if (match.trip.availableSeats < seatsRequested) {
      throw new AppError(
        `Only ${match.trip.availableSeats} seat(s) available`,
        400
      );
    }

    // Use transaction to ensure atomic seat allocation
    const result = await prisma.$transaction(async (tx) => {
      // Lock and update trip seats
      const updatedTrip = await tx.trip.update({
        where: { id: match.tripId },
        data: {
          availableSeats: { decrement: seatsRequested },
        },
      });

      // Update match
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'accepted',
          seatsConfirmed: seatsRequested,
          seatsRequested,
          fareShare: match.trip.farePerPerson
            ? Number(match.trip.farePerPerson) * seatsRequested
            : null,
          acceptedAt: new Date(),
        },
      });

      // Increment user's trip count
      await tx.user.update({
        where: { id: userId },
        data: {},
      });

      return { updatedMatch, updatedTrip };
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: match.trip.createdBy,
        type: 'match_confirmed',
        title: 'Match Accepted! 🎉',
        message: `Someone confirmed their participation with ${seatsRequested} seat(s)!`,
        matchId: matchId,
        tripId: match.tripId,
      },
    });

    // Auto-close trip if full
    if (result.updatedTrip.availableSeats === 0) {
      await prisma.trip.update({
        where: { id: match.tripId },
        data: { status: 'in_progress' },
      });
    }

    // Get chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { tripId: match.tripId },
    });

    return {
      match: {
        id: result.updatedMatch.id,
        status: result.updatedMatch.status,
        seatsConfirmed: result.updatedMatch.seatsConfirmed,
        fareShare: result.updatedMatch.fareShare
          ? Number(result.updatedMatch.fareShare)
          : null,
        acceptedAt: result.updatedMatch.acceptedAt,
      },
      trip: {
        id: match.trip.id,
        availableSeats: result.updatedTrip.availableSeats,
        origin: match.trip.originCity,
        destination: match.trip.destinationCity,
      },
      chatRoomId: chatRoom?.id ?? null,
    };
  }

  // 4.7 Reject Match
  async rejectMatch(userId: string, matchId: string, reason?: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        trip: {
          select: {
            id: true,
            createdBy: true,
            originCity: true,
            destinationCity: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Verify user is the matched user
    if (match.matchedUserId !== userId) {
      throw new AppError('You are not authorized to reject this match', 403);
    }

    // Check match is pending
    if (match.status !== 'pending') {
      throw new AppError(`Match is already ${match.status}`, 400);
    }

    // Update match
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Notify creator (optional, might not want to notify rejection)
    // Keeping notification off for rejections to avoid negative UX

    return {
      message: 'Match rejected successfully',
    };
  }

  // 4.8 Cancel Match (Before Trip)
  async cancelMatch(userId: string, matchId: string, reason?: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        trip: {
          select: {
            id: true,
            createdBy: true,
            departureDate: true,
            departureTime: true,
            originCity: true,
            destinationCity: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Verify user is the matched user
    if (match.matchedUserId !== userId) {
      throw new AppError('You are not authorized to cancel this match', 403);
    }

    // Check match is accepted
    if (match.status !== 'accepted') {
      throw new AppError('Can only cancel accepted matches', 400);
    }

    // Calculate time until departure for penalty
    const departureDateTime = new Date(
      `${match.trip.departureDate}T${match.trip.departureTime}`
    );
    const hoursUntilDeparture =
      (departureDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    // Determine trust score penalty
    let trustPenalty = 0;
    if (hoursUntilDeparture < 24) {
      trustPenalty = -0.3;
    } else if (hoursUntilDeparture < 48) {
      trustPenalty = -0.1;
    }

    // Use transaction
    await prisma.$transaction(async (tx) => {
      // Return seats to trip
      await tx.trip.update({
        where: { id: match.tripId },
        data: {
          availableSeats: { increment: match.seatsConfirmed },
        },
      });

      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // Update user stats and trust score
      await tx.user.update({
        where: { id: userId },
        data: {
          totalTripsCancelled: { increment: 1 },
          trustScore: { increment: trustPenalty },
        },
      });
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: match.trip.createdBy,
        type: 'trip_cancelled',
        title: 'Participant Cancelled',
        message: `A participant cancelled their spot for your trip to ${match.trip.destinationCity}`,
        tripId: match.tripId,
        matchId: matchId,
      },
    });

    return {
      message: 'Match cancelled successfully',
      trustPenalty,
    };
  }

  // Get My Matches
  async getMyMatches(
    userId: string,
    filters: {
      status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'all';
      role: 'creator' | 'participant' | 'all';
      page: number;
      limit: number;
    }
  ) {
    // Build where clause
    const where: any = {
      OR: [{ matchedUserId: userId }, { tripCreatorId: userId }],
    };

    if (filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.role === 'creator') {
      where.OR = [{ tripCreatorId: userId }];
    } else if (filters.role === 'participant') {
      where.OR = [{ matchedUserId: userId }];
    }

    const total = await prisma.match.count({ where });

    const matches = await prisma.match.findMany({
      where,
      include: {
        trip: {
          select: {
            id: true,
            type: true,
            status: true,
            originCity: true,
            destinationCity: true,
            departureDate: true,
            departureTime: true,
            totalSeats: true,
            availableSeats: true,
            farePerPerson: true,
          },
        },
        tripCreator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
          },
        },
        matchedUser: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
          },
        },
      },
      orderBy: { matchedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Get chat rooms for matched trips
    const tripIds = matches.map((m) => m.tripId);
    const chatRooms = await prisma.chatRoom.findMany({
      where: { tripId: { in: tripIds } },
      select: { tripId: true, id: true },
    });
    const chatRoomMap = new Map(chatRooms.map((c) => [c.tripId, c.id]));

    return {
      matches: matches.map((match) => ({
        id: match.id,
        status: match.status,
        seatsRequested: match.seatsRequested,
        seatsConfirmed: match.seatsConfirmed,
        fareShare: match.fareShare ? Number(match.fareShare) : null,
        matchedAt: match.matchedAt,
        acceptedAt: match.acceptedAt,
        role: match.tripCreatorId === userId ? 'creator' : 'participant',
        trip: {
          id: match.trip.id,
          type: match.trip.type,
          status: match.trip.status,
          origin: match.trip.originCity,
          destination: match.trip.destinationCity,
          departureDate: match.trip.departureDate,
          departureTime: match.trip.departureTime,
          seats: {
            total: match.trip.totalSeats,
            available: match.trip.availableSeats,
          },
        },
        otherUser:
          match.tripCreatorId === userId
            ? match.matchedUser
            : match.tripCreator,
        chatRoomId: chatRoomMap.get(match.tripId) ?? null,
      })),
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  // Get Match Details
  async getMatchDetails(userId: string, matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        trip: {
          select: {
            id: true,
            type: true,
            status: true,
            originCity: true,
            destinationCity: true,
            departureDate: true,
            departureTime: true,
            totalSeats: true,
            availableSeats: true,
            farePerPerson: true,
            description: true,
            vibeTags: true,
          },
        },
        tripCreator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
            collegeName: true,
            department: true,
          },
        },
        matchedUser: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
            collegeName: true,
            department: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Verify user is part of this match
    if (match.matchedUserId !== userId && match.tripCreatorId !== userId) {
      throw new AppError('You are not authorized to view this match', 403);
    }

    // Get chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { tripId: match.tripId },
    });

    return {
      id: match.id,
      status: match.status,
      seatsRequested: match.seatsRequested,
      seatsConfirmed: match.seatsConfirmed,
      fareShare: match.fareShare ? Number(match.fareShare) : null,
      paymentStatus: match.paymentStatus,
      matchedAt: match.matchedAt,
      acceptedAt: match.acceptedAt,
      rejectedAt: match.rejectedAt,
      cancelledAt: match.cancelledAt,
      cancellationReason: match.cancellationReason,
      role: match.tripCreatorId === userId ? 'creator' : 'participant',
      trip: {
        id: match.trip.id,
        type: match.trip.type,
        status: match.trip.status,
        origin: match.trip.originCity,
        destination: match.trip.destinationCity,
        departureDate: match.trip.departureDate,
        departureTime: match.trip.departureTime,
        description: match.trip.description,
        vibeTags: match.trip.vibeTags,
        seats: {
          total: match.trip.totalSeats,
          available: match.trip.availableSeats,
        },
        farePerPerson: match.trip.farePerPerson
          ? Number(match.trip.farePerPerson)
          : null,
      },
      creator: match.tripCreator,
      participant: match.matchedUser,
      chatRoomId: chatRoom?.id ?? null,
    };
  }

  // Get pending matches count for a user
  async getPendingMatchesCount(userId: string) {
    return prisma.match.count({
      where: {
        matchedUserId: userId,
        status: 'pending',
      },
    });
  }
}

export const matchService = new MatchService();
