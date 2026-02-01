import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateTripInput,
  UpdateTripInput,
  SearchTripsInput,
  NearbyTripsInput,
  CancelTripInput,
  MyTripsQueryInput,
} from '../validators/trip.validator.js';
import { Prisma } from '@prisma/client';

export class TripService {
  // 3.1 Create Trip
  async createTrip(userId: string, data: CreateTripInput) {
    // Verify user email is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, gender: true },
    });

    if (!user?.emailVerified) {
      throw new AppError('Email must be verified to create trips', 403);
    }

    // Calculate fare per person for cab pool
    const farePerPerson = data.type === 'cab_pool' && data.estimatedFare
      ? Number((data.estimatedFare / data.totalSeats).toFixed(2))
      : null;

    // Parse departure date and time
    const departureDate = new Date(data.departureDate);
    const [hours, minutes] = data.departureTime.split(':').map(Number);
    const departureTime = new Date(1970, 0, 1, hours, minutes, 0);

    const trip = await prisma.trip.create({
      data: {
        createdBy: userId,
        type: data.type,
        status: 'open',
        
        // Origin
        originCity: data.originCity,
        originLat: data.originLat,
        originLng: data.originLng,
        originAddress: data.originAddress,
        
        // Destination
        destinationCity: data.destinationCity,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        destinationAddress: data.destinationAddress,
        
        // Timing
        departureDate,
        departureTime,
        departureTimeWindow: data.departureTimeWindow,
        estimatedDuration: data.estimatedDuration,
        
        // Capacity
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        
        // Details
        title: data.title,
        description: data.description,
        vibeTags: data.vibeTags || [],
        
        // Cab Pool
        estimatedFare: data.estimatedFare,
        farePerPerson,
        luggageSpace: data.luggageSpace ?? true,
        
        // Filters
        genderPreference: data.genderPreference || (user.gender === 'female' ? 'female' : 'any'),
        sameDepartmentOnly: data.sameDepartmentOnly ?? false,
        sameYearOnly: data.sameYearOnly ?? false,
        verifiedUsersOnly: data.verifiedUsersOnly ?? true,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
            totalTripsCompleted: true,
            isVerified: true,
          },
        },
      },
    });

    return this.formatTrip(trip);
  }

  // 3.2 Get Trip Details
  async getTripDetails(tripId: string, userId?: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            collegeName: true,
            department: true,
            trustScore: true,
            totalTripsCompleted: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            swipes: { where: { direction: { in: ['right', 'super'] } } },
            matches: { where: { status: 'accepted' } },
          },
        },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Check if viewer is blocked by creator
    if (userId && userId !== trip.createdBy) {
      const blocked = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: trip.createdBy, blockedId: userId },
            { blockerId: userId, blockedId: trip.createdBy },
          ],
        },
      });

      if (blocked) {
        throw new AppError('Trip not found', 404);
      }
    }

    // Check if user already swiped
    let userSwiped = null;
    let isParticipant = false;
    
    if (userId) {
      const swipe = await prisma.swipe.findUnique({
        where: { tripId_userId: { tripId, userId } },
        select: { direction: true },
      });
      userSwiped = swipe?.direction || null;

      // Check if user is a participant
      const match = await prisma.match.findFirst({
        where: { tripId, matchedUserId: userId, status: 'accepted' },
      });
      isParticipant = !!match;
    }

    // Increment view count
    await prisma.trip.update({
      where: { id: tripId },
      data: { viewCount: { increment: 1 } },
    });

    // Get participants if user is creator or participant
    let participants = null;
    if (userId && (userId === trip.createdBy || isParticipant)) {
      participants = await this.getTripParticipants(tripId);
    }

    return {
      ...this.formatTrip(trip),
      totalSwipes: trip._count.swipes,
      confirmedParticipants: trip._count.matches,
      userSwiped,
      isParticipant,
      isCreator: userId === trip.createdBy,
      participants,
    };
  }

  // 3.3 Search/Discover Trips
  async searchTrips(userId: string, filters: SearchTripsInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true, department: true, yearOfStudy: true },
    });

    // Get blocked users
    const blocks = await prisma.userBlock.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: { blockerId: true, blockedId: true },
    });
    const blockedUserIds = new Set(
      blocks.flatMap(b => [b.blockerId, b.blockedId]).filter(id => id !== userId)
    );

    // Get trips user already swiped on
    const swipedTrips = await prisma.swipe.findMany({
      where: { userId },
      select: { tripId: true },
    });
    const swipedTripIds = new Set(swipedTrips.map(s => s.tripId));

    // Build where clause
    const where: Prisma.TripWhereInput = {
      status: filters.status || 'open',
      isActive: true,
      createdBy: { not: userId },
      availableSeats: { gte: filters.minSeats || 1 },
      departureDate: { gte: new Date() },
      
      // Exclude blocked users and already swiped trips
      AND: [
        { createdBy: { notIn: Array.from(blockedUserIds) } },
        { id: { notIn: Array.from(swipedTripIds) } },
      ],
    };

    // Apply filters
    if (filters.originCity) {
      where.originCity = { contains: filters.originCity, mode: 'insensitive' };
    }
    if (filters.destinationCity) {
      where.destinationCity = { contains: filters.destinationCity, mode: 'insensitive' };
    }
    if (filters.departureDate) {
      const startDate = new Date(filters.departureDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = filters.departureDateEnd 
        ? new Date(filters.departureDateEnd) 
        : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      where.departureDate = { gte: startDate, lte: endDate };
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.verifiedOnly) {
      where.creator = { isVerified: true };
    }
    if (filters.minTrustScore) {
      where.creator = { 
        ...where.creator as object, 
        trustScore: { gte: filters.minTrustScore } 
      };
    }
    if (filters.vibeTags) {
      const tags = filters.vibeTags.split(',').map(t => t.trim().toLowerCase());
      where.vibeTags = { hasSome: tags };
    }

    // Gender preference matching - include trips that:
    // 1. Have no gender preference (null)
    // 2. Have 'any' gender preference
    // 3. Match the user's gender
    // 4. Have 'same' preference and creator is same gender as user
    if (user?.gender) {
      where.OR = [
        { genderPreference: null },
        { genderPreference: 'any' },
        { genderPreference: user.gender },
        { genderPreference: 'same', creator: { gender: user.gender } },
      ];
    }

    // Sort configuration
    const orderBy: Prisma.TripOrderByWithRelationInput[] = [];
    switch (filters.sortBy) {
      case 'departure':
        orderBy.push({ departureDate: filters.sortOrder });
        orderBy.push({ departureTime: filters.sortOrder });
        break;
      case 'trustScore':
        orderBy.push({ creator: { trustScore: filters.sortOrder } });
        break;
      case 'createdAt':
        orderBy.push({ createdAt: filters.sortOrder });
        break;
    }

    // Execute query
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
              collegeName: true,
              trustScore: true,
              totalTripsCompleted: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              matches: { where: { status: 'accepted' } },
            },
          },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      trips: trips.map(trip => ({
        ...this.formatTrip(trip),
        confirmedParticipants: trip._count.matches,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  // 3.4 Get Nearby Trips
  async getNearbyTrips(userId: string, filters: NearbyTripsInput) {
    // Since PostGIS extensions might not be available, use a simple lat/lng range
    const latRange = filters.radiusKm / 111; // ~111km per degree latitude
    const lngRange = filters.radiusKm / (111 * Math.cos(filters.lat * Math.PI / 180));

    const where: Prisma.TripWhereInput = {
      status: 'open',
      isActive: true,
      createdBy: { not: userId },
      departureDate: { gte: new Date() },
      originLat: {
        gte: filters.lat - latRange,
        lte: filters.lat + latRange,
      },
      originLng: {
        gte: filters.lng - lngRange,
        lte: filters.lng + lngRange,
      },
    };

    const trips = await prisma.trip.findMany({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            collegeName: true,
            trustScore: true,
            isVerified: true,
          },
        },
      },
    });

    // Calculate distance and sort
    const tripsWithDistance = trips.map(trip => {
      const distance = this.calculateDistance(
        filters.lat, 
        filters.lng, 
        Number(trip.originLat), 
        Number(trip.originLng)
      );
      return {
        ...this.formatTrip(trip),
        distanceKm: Math.round(distance * 10) / 10,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      trips: tripsWithDistance,
      pagination: {
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  // 3.5 Update Trip
  async updateTrip(tripId: string, userId: string, data: UpdateTripInput) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        _count: {
          select: { matches: { where: { status: 'accepted' } } },
        },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (trip.createdBy !== userId) {
      throw new AppError('You are not authorized to update this trip', 403);
    }

    if (trip.status !== 'open') {
      throw new AppError('Cannot update trip that is not open', 400);
    }

    // Cannot reduce seats below confirmed participants
    if (data.totalSeats && data.totalSeats < trip._count.matches) {
      throw new AppError(
        `Cannot reduce seats below ${trip._count.matches} confirmed participants`,
        400
      );
    }

    // Calculate new available seats if total seats changed
    const availableSeats = data.totalSeats 
      ? data.totalSeats - trip._count.matches 
      : undefined;

    // Parse departure time if provided
    let departureTime: Date | undefined;
    if (data.departureTime) {
      const [hours, minutes] = data.departureTime.split(':').map(Number);
      departureTime = new Date(1970, 0, 1, hours, minutes, 0);
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(departureTime && { departureTime }),
        ...(data.departureTimeWindow !== undefined && { departureTimeWindow: data.departureTimeWindow }),
        ...(data.vibeTags && { vibeTags: data.vibeTags }),
        ...(data.genderPreference && { genderPreference: data.genderPreference }),
        ...(data.luggageSpace !== undefined && { luggageSpace: data.luggageSpace }),
        ...(data.totalSeats && { totalSeats: data.totalSeats }),
        ...(availableSeats !== undefined && { availableSeats }),
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
          },
        },
      },
    });

    // TODO: Notify participants of critical changes

    return this.formatTrip(updated);
  }

  // 3.6 Cancel Trip
  async cancelTrip(tripId: string, userId: string, data: CancelTripInput) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        matches: { where: { status: 'accepted' } },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (trip.createdBy !== userId) {
      throw new AppError('You are not authorized to cancel this trip', 403);
    }

    if (trip.status === 'completed') {
      throw new AppError('Cannot cancel completed trip', 400);
    }

    if (trip.status === 'cancelled') {
      throw new AppError('Trip is already cancelled', 400);
    }

    // Calculate trust score penalty
    const departureDateTime = new Date(trip.departureDate);
    departureDateTime.setHours(
      trip.departureTime.getHours(),
      trip.departureTime.getMinutes()
    );
    const hoursUntilDeparture = (departureDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    
    let trustPenalty = 0;
    if (hoursUntilDeparture < 24) {
      trustPenalty = 0.3;
    } else if (hoursUntilDeparture < 48) {
      trustPenalty = 0.1;
    }

    // Update trip and matches in transaction
    await prisma.$transaction(async (tx) => {
      // Cancel trip
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'cancelled',
          isActive: false,
          availableSeats: trip.totalSeats,
        },
      });

      // Cancel all matches
      await tx.match.updateMany({
        where: { tripId, status: { in: ['pending', 'accepted'] } },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: data.reason || 'Trip cancelled by creator',
        },
      });

      // Update creator stats
      await tx.user.update({
        where: { id: userId },
        data: {
          totalTripsCancelled: { increment: 1 },
          trustScore: { decrement: trustPenalty },
        },
      });

      // Create notifications for all matched users
      const notificationData = trip.matches.map(match => ({
        userId: match.matchedUserId,
        type: 'trip_cancelled' as const,
        title: 'Trip Cancelled',
        message: `A trip you joined has been cancelled`,
        data: { tripId },
      }));

      if (notificationData.length > 0) {
        await tx.notification.createMany({ data: notificationData });
      }
    });

    return { message: 'Trip cancelled successfully' };
  }

  // 3.7 Mark Trip In Progress
  async markTripInProgress(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        matches: { where: { status: 'accepted' }, select: { matchedUserId: true } },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Check if user is creator or participant
    const isParticipant = trip.matches.some(m => m.matchedUserId === userId);
    if (trip.createdBy !== userId && !isParticipant) {
      throw new AppError('You are not authorized to update this trip', 403);
    }

    if (trip.status !== 'open') {
      throw new AppError('Trip is not in open status', 400);
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: { status: 'in_progress' },
    });

    return this.formatTrip(updated);
  }

  // 3.8 Mark Trip Completed
  async markTripCompleted(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        matches: { where: { status: 'accepted' } },
      },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (trip.createdBy !== userId) {
      throw new AppError('Only the trip creator can mark it as completed', 403);
    }

    if (trip.status !== 'in_progress') {
      throw new AppError('Trip must be in progress to complete', 400);
    }

    await prisma.$transaction(async (tx) => {
      // Update trip
      await tx.trip.update({
        where: { id: tripId },
        data: { status: 'completed', isActive: false },
      });

      // Update creator stats
      await tx.user.update({
        where: { id: userId },
        data: { totalTripsCompleted: { increment: 1 } },
      });

      // Update all participants stats
      const participantIds = trip.matches.map(m => m.matchedUserId);
      if (participantIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: participantIds } },
          data: { totalTripsCompleted: { increment: 1 } },
        });
      }

      // Send review reminder notifications
      const allUserIds = [userId, ...participantIds];
      const notifications = allUserIds.map(uid => ({
        userId: uid,
        type: 'review_reminder' as const,
        title: 'Leave a Review',
        message: 'Your trip is complete! Leave reviews for your travel companions.',
        data: { tripId },
      }));

      await tx.notification.createMany({ data: notifications });

      // Archive chat room after 24h (handled by cron job)
    });

    return { message: 'Trip marked as completed' };
  }

  // 3.9 Get My Trips (Created)
  async getMyCreatedTrips(userId: string, filters: MyTripsQueryInput) {
    const where: Prisma.TripWhereInput = {
      createdBy: userId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { departureDate: 'asc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: {
            select: {
              swipes: { where: { direction: { in: ['right', 'super'] } } },
              matches: { where: { status: 'accepted' } },
            },
          },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      trips: trips.map(trip => ({
        ...this.formatTrip(trip),
        pendingSwipes: trip._count.swipes,
        confirmedParticipants: trip._count.matches,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  // 3.10 Get My Trips (Joined)
  async getMyJoinedTrips(userId: string, filters: MyTripsQueryInput) {
    const where: Prisma.MatchWhereInput = {
      matchedUserId: userId,
      status: 'accepted',
    };

    if (filters.status) {
      where.trip = { status: filters.status };
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { trip: { departureDate: 'asc' } },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          trip: {
            include: {
              creator: {
                select: {
                  id: true,
                  fullName: true,
                  profilePhotoUrl: true,
                  trustScore: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      }),
      prisma.match.count({ where }),
    ]);

    return {
      trips: matches.map(match => ({
        ...this.formatTrip(match.trip),
        seatsConfirmed: match.seatsConfirmed,
        fareShare: match.fareShare ? Number(match.fareShare) : null,
        matchedAt: match.matchedAt,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  // 3.11 Get Trip Participants
  async getTripParticipants(tripId: string, userId?: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { createdBy: true },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify access if userId provided
    if (userId) {
      const isParticipant = await prisma.match.findFirst({
        where: { tripId, matchedUserId: userId, status: 'accepted' },
      });

      if (trip.createdBy !== userId && !isParticipant) {
        throw new AppError('You do not have access to view participants', 403);
      }
    }

    // Get creator
    const creator = await prisma.user.findUnique({
      where: { id: trip.createdBy },
      select: {
        id: true,
        fullName: true,
        profilePhotoUrl: true,
        trustScore: true,
        isVerified: true,
      },
    });

    // Get matched participants
    const matches = await prisma.match.findMany({
      where: { tripId, status: 'accepted' },
      include: {
        matchedUser: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            trustScore: true,
            isVerified: true,
          },
        },
      },
      orderBy: { acceptedAt: 'asc' },
    });

    return [
      {
        ...creator,
        role: 'creator',
        seatsConfirmed: null,
        joinedAt: null,
      },
      ...matches.map(m => ({
        ...m.matchedUser,
        role: 'participant',
        seatsConfirmed: m.seatsConfirmed,
        joinedAt: m.acceptedAt,
      })),
    ];
  }

  // 3.12 Get Trip Analytics (Creator Only)
  async getTripAnalytics(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (trip.createdBy !== userId) {
      throw new AppError('Only the trip creator can view analytics', 403);
    }

    const [swipeStats, matchStats] = await Promise.all([
      prisma.swipe.groupBy({
        by: ['direction'],
        where: { tripId },
        _count: true,
      }),
      prisma.match.groupBy({
        by: ['status'],
        where: { tripId },
        _count: true,
      }),
    ]);

    const swipes = {
      right: swipeStats.find(s => s.direction === 'right')?._count || 0,
      left: swipeStats.find(s => s.direction === 'left')?._count || 0,
      super: swipeStats.find(s => s.direction === 'super')?._count || 0,
    };

    const totalPositiveSwipes = swipes.right + swipes.super;
    const acceptedMatches = matchStats.find(m => m.status === 'accepted')?._count || 0;

    return {
      viewCount: trip.viewCount,
      swipeCount: trip.swipeCount,
      swipes,
      totalPositiveSwipes,
      conversionRate: totalPositiveSwipes > 0 
        ? Math.round((acceptedMatches / totalPositiveSwipes) * 100) 
        : 0,
      matches: {
        pending: matchStats.find(m => m.status === 'pending')?._count || 0,
        accepted: acceptedMatches,
        rejected: matchStats.find(m => m.status === 'rejected')?._count || 0,
        cancelled: matchStats.find(m => m.status === 'cancelled')?._count || 0,
      },
      seatsStatus: {
        total: trip.totalSeats,
        available: trip.availableSeats,
        filled: trip.totalSeats - trip.availableSeats,
        fillRate: Math.round(((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100),
      },
    };
  }

  // Helper: Format trip for response
  private formatTrip(trip: any) {
    // Convert creator's trustScore from Decimal to number
    const creator = trip.creator ? {
      ...trip.creator,
      trustScore: trip.creator.trustScore ? Number(trip.creator.trustScore) : null,
    } : null;

    return {
      id: trip.id,
      type: trip.type,
      status: trip.status,
      
      origin: {
        city: trip.originCity,
        lat: trip.originLat ? Number(trip.originLat) : null,
        lng: trip.originLng ? Number(trip.originLng) : null,
        address: trip.originAddress,
      },
      destination: {
        city: trip.destinationCity,
        lat: trip.destinationLat ? Number(trip.destinationLat) : null,
        lng: trip.destinationLng ? Number(trip.destinationLng) : null,
        address: trip.destinationAddress,
      },
      
      departure: {
        date: trip.departureDate,
        time: trip.departureTime,
        timeWindow: trip.departureTimeWindow,
      },
      estimatedDuration: trip.estimatedDuration,
      
      seats: {
        total: trip.totalSeats,
        available: trip.availableSeats,
      },
      
      title: trip.title,
      description: trip.description,
      vibeTags: trip.vibeTags,
      
      fare: trip.type === 'cab_pool' ? {
        estimated: trip.estimatedFare ? Number(trip.estimatedFare) : null,
        perPerson: trip.farePerPerson ? Number(trip.farePerPerson) : null,
      } : null,
      luggageSpace: trip.luggageSpace,
      
      filters: {
        genderPreference: trip.genderPreference,
        sameDepartmentOnly: trip.sameDepartmentOnly,
        sameYearOnly: trip.sameYearOnly,
        verifiedUsersOnly: trip.verifiedUsersOnly,
      },
      
      viewCount: trip.viewCount,
      swipeCount: trip.swipeCount,
      
      creator,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  // Helper: Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const tripService = new TripService();
