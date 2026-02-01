import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateReviewInput, UpdateReviewInput } from '../validators/review.validator.js';
import type { Prisma } from '@prisma/client';

type Decimal = Prisma.Decimal;

class ReviewService {
  // 6.1 Create Review
  async createReview(reviewerId: string, data: CreateReviewInput) {
    // Verify trip exists and is completed
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
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

    if (trip.status !== 'completed') {
      throw new AppError('Can only review completed trips', 400);
    }

    // Verify reviewer was part of the trip
    const isCreator = trip.createdBy === reviewerId;
    const isParticipant = trip.matches.some(m => m.matchedUserId === reviewerId);

    if (!isCreator && !isParticipant) {
      throw new AppError('You were not part of this trip', 403);
    }

    // For companion reviews, verify the reviewed user was also part of the trip
    if (data.type === 'companion' && data.reviewedUserId) {
      if (data.reviewedUserId === reviewerId) {
        throw new AppError('Cannot review yourself', 400);
      }

      const reviewedIsCreator = trip.createdBy === data.reviewedUserId;
      const reviewedIsParticipant = trip.matches.some(m => m.matchedUserId === data.reviewedUserId);

      if (!reviewedIsCreator && !reviewedIsParticipant) {
        throw new AppError('Reviewed user was not part of this trip', 400);
      }
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        tripId: data.tripId,
        reviewerId,
        reviewedUserId: data.type === 'companion' ? data.reviewedUserId : null,
        type: data.type,
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        tripId: data.tripId,
        reviewerId,
        reviewedUserId: data.type === 'companion' ? data.reviewedUserId : null,
        type: data.type,
        overallRating: data.overallRating,
        punctualityRating: data.punctualityRating,
        planningRating: data.planningRating,
        costFairnessRating: data.costFairnessRating,
        coordinationRating: data.coordinationRating,
        positiveTags: data.positiveTags,
        neutralTags: data.neutralTags,
        negativeTags: data.negativeTags,
        comment: data.comment,
        isPublic: data.isPublic,
        isVerified: true, // Auto-verified since we confirmed trip participation
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        reviewedUser: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        trip: {
          select: {
            id: true,
            originCity: true,
            destinationCity: true,
            departureDate: true,
          },
        },
      },
    });

    // Update reviewed user's trust score if companion review
    if (data.type === 'companion' && data.reviewedUserId) {
      await this.updateUserTrustScore(data.reviewedUserId);
    }

    return this.formatReview(review);
  }

  // 6.2 Update Review
  async updateReview(reviewerId: string, reviewId: string, data: Partial<UpdateReviewInput>) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.reviewerId !== reviewerId) {
      throw new AppError('Not authorized to update this review', 403);
    }

    // Check if within 7 days of creation
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (review.createdAt < sevenDaysAgo) {
      throw new AppError('Reviews can only be edited within 7 days', 403);
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        overallRating: data.overallRating,
        punctualityRating: data.punctualityRating,
        planningRating: data.planningRating,
        costFairnessRating: data.costFairnessRating,
        coordinationRating: data.coordinationRating,
        positiveTags: data.positiveTags,
        neutralTags: data.neutralTags,
        negativeTags: data.negativeTags,
        comment: data.comment,
        isPublic: data.isPublic,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        reviewedUser: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        trip: {
          select: {
            id: true,
            originCity: true,
            destinationCity: true,
            departureDate: true,
          },
        },
      },
    });

    // Update trust score if rating changed
    if (data.overallRating && review.reviewedUserId) {
      await this.updateUserTrustScore(review.reviewedUserId);
    }

    return this.formatReview(updated);
  }

  // 6.3 Delete Review
  async deleteReview(reviewerId: string, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.reviewerId !== reviewerId) {
      throw new AppError('Not authorized to delete this review', 403);
    }

    // Check if within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (review.createdAt < oneDayAgo) {
      throw new AppError('Reviews can only be deleted within 24 hours', 403);
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate trust score
    if (review.reviewedUserId) {
      await this.updateUserTrustScore(review.reviewedUserId);
    }

    return { message: 'Review deleted successfully' };
  }

  // 6.4 Get Reviews for User
  async getUserReviews(userId: string, options: { page: number; limit: number }) {
    const where = {
      reviewedUserId: userId,
      isPublic: true,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
            },
          },
          trip: {
            select: {
              id: true,
              originCity: true,
              destinationCity: true,
              departureDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map(r => this.formatReview(r)),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // 6.5 Get Reviews for Trip
  async getTripReviews(tripId: string, options: { page: number; limit: number }) {
    const where = { tripId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
            },
          },
          reviewedUser: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map(r => this.formatReview(r)),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // 6.6 Get My Reviews
  async getMyReviews(
    userId: string,
    type: 'given' | 'received',
    options: { page: number; limit: number }
  ) {
    const where = type === 'given' ? { reviewerId: userId } : { reviewedUserId: userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
            },
          },
          reviewedUser: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
            },
          },
          trip: {
            select: {
              id: true,
              originCity: true,
              destinationCity: true,
              departureDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map(r => this.formatReview(r)),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // 6.7 Get Pending Reviews
  async getPendingReviews(userId: string, options: { page: number; limit: number }) {
    // Find completed trips where user was a participant but hasn't reviewed
    const completedTrips = await prisma.trip.findMany({
      where: {
        status: 'completed',
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
      },
      include: {
        reviews: {
          where: { reviewerId: userId },
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
    });

    // Filter to trips with pending reviews
    const pendingReviews: any[] = [];

    for (const trip of completedTrips) {
      const existingReviewedUsers = trip.reviews.map(r => r.reviewedUserId);
      const hasTripReview = trip.reviews.some(r => r.type === 'trip');

      // Check if trip review is pending
      if (!hasTripReview) {
        pendingReviews.push({
          tripId: trip.id,
          type: 'trip',
          trip: {
            id: trip.id,
            origin: trip.originCity,
            destination: trip.destinationCity,
            departureDate: trip.departureDate,
          },
          reviewedUser: null,
        });
      }

      // Check for pending companion reviews
      const participants = [
        trip.creator,
        ...trip.matches.map(m => m.matchedUser),
      ].filter(p => p.id !== userId);

      for (const participant of participants) {
        if (!existingReviewedUsers.includes(participant.id)) {
          pendingReviews.push({
            tripId: trip.id,
            type: 'companion',
            trip: {
              id: trip.id,
              origin: trip.originCity,
              destination: trip.destinationCity,
              departureDate: trip.departureDate,
            },
            reviewedUser: participant,
          });
        }
      }
    }

    // Paginate
    const total = pendingReviews.length;
    const paginated = pendingReviews.slice(
      (options.page - 1) * options.limit,
      options.page * options.limit
    );

    return {
      pendingReviews: paginated,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // 6.8 Get Review Summary
  async getReviewSummary(userId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        reviewedUserId: userId,
        type: 'companion',
      },
      select: {
        overallRating: true,
        punctualityRating: true,
        planningRating: true,
        costFairnessRating: true,
        coordinationRating: true,
        positiveTags: true,
        neutralTags: true,
        negativeTags: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: {
          overall: 0,
          punctuality: 0,
          planning: 0,
          costFairness: 0,
          coordination: 0,
        },
        topPositiveTags: [],
        topNeutralTags: [],
        topNegativeTags: [],
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate averages
    const avg = (values: (Decimal | null)[]) => {
      const valid = values.filter((v): v is Decimal => v !== null);
      if (valid.length === 0) return 0;
      return valid.reduce((sum, v) => sum + Number(v), 0) / valid.length;
    };

    const avgOverall = avg(reviews.map(r => r.overallRating));
    const avgPunctuality = avg(reviews.map(r => r.punctualityRating));
    const avgPlanning = avg(reviews.map(r => r.planningRating));
    const avgCostFairness = avg(reviews.map(r => r.costFairnessRating));
    const avgCoordination = avg(reviews.map(r => r.coordinationRating));

    // Count tags
    const countTags = (tagArrays: string[][]) => {
      const counts: Record<string, number> = {};
      for (const tags of tagArrays) {
        for (const tag of tags) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));
    };

    const topPositiveTags = countTags(reviews.map(r => r.positiveTags));
    const topNeutralTags = countTags(reviews.map(r => r.neutralTags));
    const topNegativeTags = countTags(reviews.map(r => r.negativeTags));

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      const rating = Math.round(Number(review.overallRating)) as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    }

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(avgOverall * 10) / 10,
      ratingBreakdown: {
        overall: Math.round(avgOverall * 10) / 10,
        punctuality: Math.round(avgPunctuality * 10) / 10,
        planning: Math.round(avgPlanning * 10) / 10,
        costFairness: Math.round(avgCostFairness * 10) / 10,
        coordination: Math.round(avgCoordination * 10) / 10,
      },
      topPositiveTags,
      topNeutralTags,
      topNegativeTags,
      ratingDistribution: distribution,
    };
  }

  // Update user trust score based on reviews
  private async updateUserTrustScore(userId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        reviewedUserId: userId,
        type: 'companion',
      },
      select: { overallRating: true },
    });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / reviews.length;
    const trustScore = Math.min(5, Math.max(1, avgRating));

    await prisma.user.update({
      where: { id: userId },
      data: { trustScore: Math.round(trustScore * 10) / 10 },
    });
  }

  // Format review for response
  private formatReview(review: any) {
    return {
      id: review.id,
      tripId: review.tripId,
      type: review.type,
      overallRating: Number(review.overallRating),
      punctualityRating: review.punctualityRating ? Number(review.punctualityRating) : null,
      planningRating: review.planningRating ? Number(review.planningRating) : null,
      costFairnessRating: review.costFairnessRating ? Number(review.costFairnessRating) : null,
      coordinationRating: review.coordinationRating ? Number(review.coordinationRating) : null,
      positiveTags: review.positiveTags,
      neutralTags: review.neutralTags,
      negativeTags: review.negativeTags,
      comment: review.comment,
      isVerified: review.isVerified,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
      reviewer: review.reviewer || null,
      reviewedUser: review.reviewedUser || null,
      trip: review.trip || null,
    };
  }
}

export const reviewService = new ReviewService();
