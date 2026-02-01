-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "cube";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('travel_buddy', 'cab_pool');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('right', 'left', 'super');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('companion', 'trip');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('user', 'trip', 'chat_message');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('swipe_received', 'match_confirmed', 'trip_update', 'trip_cancelled', 'chat_message', 'review_reminder', 'payment_reminder', 'safety_alert');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "profile_photo_url" TEXT,
    "college_name" VARCHAR(255) NOT NULL,
    "college_domain" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100),
    "year_of_study" INTEGER,
    "phone_number" VARCHAR(15),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "gender" VARCHAR(20),
    "preferred_gender" VARCHAR(20),
    "trust_score" DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    "total_trips_completed" INTEGER NOT NULL DEFAULT 0,
    "total_trips_cancelled" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "user_id" UUID NOT NULL,
    "interest" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id","interest")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID NOT NULL,
    "type" "TripType" NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'open',
    "origin_city" VARCHAR(100) NOT NULL,
    "origin_lat" DECIMAL(10,8),
    "origin_lng" DECIMAL(11,8),
    "origin_address" TEXT,
    "destination_city" VARCHAR(100) NOT NULL,
    "destination_lat" DECIMAL(10,8),
    "destination_lng" DECIMAL(11,8),
    "destination_address" TEXT,
    "departure_date" DATE NOT NULL,
    "departure_time" TIME(6) NOT NULL,
    "departure_time_window" INTEGER,
    "estimated_duration" INTEGER,
    "total_seats" INTEGER NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "vibe_tags" TEXT[],
    "estimated_fare" DECIMAL(10,2),
    "fare_per_person" DECIMAL(10,2),
    "luggage_space" BOOLEAN NOT NULL DEFAULT true,
    "gender_preference" VARCHAR(20),
    "same_department_only" BOOLEAN NOT NULL DEFAULT false,
    "same_year_only" BOOLEAN NOT NULL DEFAULT false,
    "verified_users_only" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "swipe_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trip_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "introduction_message" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trip_id" UUID NOT NULL,
    "trip_creator_id" UUID NOT NULL,
    "matched_user_id" UUID NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'pending',
    "seats_requested" INTEGER NOT NULL DEFAULT 1,
    "seats_confirmed" INTEGER NOT NULL DEFAULT 0,
    "fare_share" DECIMAL(10,2),
    "payment_status" VARCHAR(20) DEFAULT 'pending',
    "payment_proof_url" TEXT,
    "matched_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(6),
    "rejected_at" TIMESTAMP(6),
    "cancelled_at" TIMESTAMP(6),
    "cancellation_reason" TEXT,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trip_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message_type" VARCHAR(20) NOT NULL,
    "payload" JSONB NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trip_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "reviewed_user_id" UUID,
    "type" "ReviewType" NOT NULL,
    "overall_rating" DECIMAL(2,1) NOT NULL,
    "punctuality_rating" DECIMAL(2,1),
    "planning_rating" DECIMAL(2,1),
    "cost_fairness_rating" DECIMAL(2,1),
    "coordination_rating" DECIMAL(2,1),
    "positive_tags" TEXT[],
    "neutral_tags" TEXT[],
    "negative_tags" TEXT[],
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "reported_user_id" UUID,
    "reported_trip_id" UUID,
    "reported_message_id" UUID,
    "reason" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_urls" TEXT[],
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "emergency_location" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "assigned_moderator_id" UUID,
    "moderator_notes" TEXT,
    "action_taken" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(6),

    CONSTRAINT "safety_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "trip_id" UUID,
    "match_id" UUID,
    "sender_id" UUID,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "relationship" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_college" ON "users"("college_domain");

-- CreateIndex
CREATE INDEX "idx_users_trust_score" ON "users"("trust_score" DESC);

-- CreateIndex
CREATE INDEX "idx_users_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_user_interests_interest" ON "user_interests"("interest");

-- CreateIndex
CREATE INDEX "idx_trips_creator" ON "trips"("created_by");

-- CreateIndex
CREATE INDEX "idx_trips_status" ON "trips"("status");

-- CreateIndex
CREATE INDEX "idx_trips_type" ON "trips"("type");

-- CreateIndex
CREATE INDEX "idx_trips_departure" ON "trips"("departure_date", "departure_time");

-- CreateIndex
CREATE INDEX "idx_trips_cities" ON "trips"("origin_city", "destination_city");

-- CreateIndex
CREATE INDEX "idx_trips_active" ON "trips"("is_active", "status", "departure_date");

-- CreateIndex
CREATE INDEX "idx_swipes_trip" ON "swipes"("trip_id");

-- CreateIndex
CREATE INDEX "idx_swipes_user" ON "swipes"("user_id");

-- CreateIndex
CREATE INDEX "idx_swipes_direction" ON "swipes"("direction");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_trip_id_user_id_key" ON "swipes"("trip_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_matches_trip" ON "matches"("trip_id");

-- CreateIndex
CREATE INDEX "idx_matches_user" ON "matches"("matched_user_id");

-- CreateIndex
CREATE INDEX "idx_matches_creator" ON "matches"("trip_creator_id");

-- CreateIndex
CREATE INDEX "idx_matches_status" ON "matches"("status");

-- CreateIndex
CREATE INDEX "idx_matches_pending" ON "matches"("trip_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "matches_trip_id_matched_user_id_key" ON "matches"("trip_id", "matched_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_trip_id_key" ON "chat_rooms"("trip_id");

-- CreateIndex
CREATE INDEX "idx_chatrooms_trip" ON "chat_rooms"("trip_id");

-- CreateIndex
CREATE INDEX "idx_chatrooms_active" ON "chat_rooms"("is_active");

-- CreateIndex
CREATE INDEX "idx_chat_room_time" ON "chat_messages"("room_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_chat_sender" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_chat_flagged" ON "chat_messages"("is_flagged");

-- CreateIndex
CREATE INDEX "idx_reviews_trip" ON "reviews"("trip_id");

-- CreateIndex
CREATE INDEX "idx_reviews_reviewed_user" ON "reviews"("reviewed_user_id");

-- CreateIndex
CREATE INDEX "idx_reviews_rating" ON "reviews"("overall_rating" DESC);

-- CreateIndex
CREATE INDEX "idx_reviews_verified" ON "reviews"("is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_trip_id_reviewer_id_reviewed_user_id_type_key" ON "reviews"("trip_id", "reviewer_id", "reviewed_user_id", "type");

-- CreateIndex
CREATE INDEX "idx_reports_status" ON "safety_reports"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_reports_reporter" ON "safety_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "idx_reports_reported_user" ON "safety_reports"("reported_user_id");

-- CreateIndex
CREATE INDEX "idx_reports_emergency" ON "safety_reports"("is_emergency", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_blocks_blocker" ON "user_blocks"("blocker_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blocker_id_blocked_id_key" ON "user_blocks"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "idx_emergency_contacts_user" ON "emergency_contacts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_user_id_phone_number_key" ON "emergency_contacts"("user_id", "phone_number");

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_trip_creator_id_fkey" FOREIGN KEY ("trip_creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_matched_user_id_fkey" FOREIGN KEY ("matched_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewed_user_id_fkey" FOREIGN KEY ("reviewed_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_reports" ADD CONSTRAINT "safety_reports_reported_trip_id_fkey" FOREIGN KEY ("reported_trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
