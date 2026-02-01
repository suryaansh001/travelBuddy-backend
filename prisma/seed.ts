import { PrismaClient, TripType, TripStatus, SwipeDirection, MatchStatus, ReviewType, ReportType, ReportStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/campusbuddy';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Test user passwords (all use "password123")
const HASHED_PASSWORD = await bcrypt.hash('password123', 12);

// Sample colleges
const colleges = [
  { domain: 'iitb.ac.in', name: 'IIT Bombay' },
  { domain: 'iitd.ac.in', name: 'IIT Delhi' },
  { domain: 'bits-pilani.ac.in', name: 'BITS Pilani' },
  { domain: 'vit.ac.in', name: 'VIT Vellore' },
];

// Sample interests
const interests = ['music', 'movies', 'travel', 'gaming', 'reading', 'sports', 'photography', 'coding', 'food', 'fitness'];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.userBlock.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👤 Creating users...');
  
  // Admin user (just a regular user with high trust score for now)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@iitb.ac.in',
      passwordHash: HASHED_PASSWORD,
      fullName: 'Admin User',
      collegeName: 'IIT Bombay',
      collegeDomain: 'iitb.ac.in',
      department: 'Computer Science',
      yearOfStudy: 4,
      phoneNumber: '+919876543210',
      phoneVerified: true,
      emailVerified: true,
      isVerified: true,
      bio: 'Platform administrator',
      gender: 'male',
      preferredGender: null,
      trustScore: new Prisma.Decimal(5.0),
      totalTripsCompleted: 50,
    },
  });

  // Regular students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'rahul@iitb.ac.in',
        passwordHash: HASHED_PASSWORD,
        fullName: 'Rahul Sharma',
        collegeName: 'IIT Bombay',
        collegeDomain: 'iitb.ac.in',
        department: 'Computer Science',
        yearOfStudy: 3,
        phoneNumber: '+919876543211',
        phoneVerified: true,
        emailVerified: true,
        isVerified: true,
        bio: 'Love traveling and meeting new people. Always up for weekend trips!',
        gender: 'male',
        preferredGender: null,
        trustScore: new Prisma.Decimal(4.5),
        totalTripsCompleted: 12,
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya@iitb.ac.in',
        passwordHash: HASHED_PASSWORD,
        fullName: 'Priya Patel',
        collegeName: 'IIT Bombay',
        collegeDomain: 'iitb.ac.in',
        department: 'Electrical Engineering',
        yearOfStudy: 2,
        phoneNumber: '+919876543212',
        phoneVerified: true,
        emailVerified: true,
        isVerified: true,
        bio: 'Music lover, foodie, and travel enthusiast 🎵🍕✈️',
        gender: 'female',
        preferredGender: 'female',
        trustScore: new Prisma.Decimal(4.8),
        totalTripsCompleted: 8,
      },
    }),
    prisma.user.create({
      data: {
        email: 'amit@iitd.ac.in',
        passwordHash: HASHED_PASSWORD,
        fullName: 'Amit Kumar',
        collegeName: 'IIT Delhi',
        collegeDomain: 'iitd.ac.in',
        department: 'Mechanical Engineering',
        yearOfStudy: 4,
        phoneNumber: '+919876543213',
        phoneVerified: true,
        emailVerified: true,
        isVerified: true,
        bio: 'Adventurer at heart. Looking for travel buddies to explore India!',
        gender: 'male',
        preferredGender: null,
        trustScore: new Prisma.Decimal(4.2),
        totalTripsCompleted: 15,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sneha@bits-pilani.ac.in',
        passwordHash: HASHED_PASSWORD,
        fullName: 'Sneha Reddy',
        collegeName: 'BITS Pilani',
        collegeDomain: 'bits-pilani.ac.in',
        department: 'Computer Science',
        yearOfStudy: 3,
        phoneNumber: '+919876543214',
        phoneVerified: true,
        emailVerified: true,
        isVerified: true,
        bio: 'Weekend warrior. Always planning the next adventure!',
        gender: 'female',
        preferredGender: null,
        trustScore: new Prisma.Decimal(4.6),
        totalTripsCompleted: 10,
      },
    }),
    prisma.user.create({
      data: {
        email: 'karan@vit.ac.in',
        passwordHash: HASHED_PASSWORD,
        fullName: 'Karan Singh',
        collegeName: 'VIT Vellore',
        collegeDomain: 'vit.ac.in',
        department: 'Information Technology',
        yearOfStudy: 2,
        phoneNumber: '+919876543215',
        phoneVerified: false,
        emailVerified: true,
        isVerified: false,
        bio: 'New to the platform. Excited to meet fellow travelers!',
        gender: 'male',
        preferredGender: null,
        trustScore: new Prisma.Decimal(3.5),
        totalTripsCompleted: 2,
      },
    }),
  ]);

  const allUsers = [admin, ...students];

  // Add interests to users
  console.log('🎯 Adding user interests...');
  for (const user of allUsers) {
    const userInterests = interests.sort(() => Math.random() - 0.5).slice(0, 4);
    await prisma.userInterest.createMany({
      data: userInterests.map((interest) => ({
        userId: user.id,
        interest,
      })),
    });
  }

  // Add emergency contacts
  console.log('🆘 Adding emergency contacts...');
  for (const user of allUsers) {
    await prisma.emergencyContact.create({
      data: {
        userId: user.id,
        name: 'Emergency Contact',
        phoneNumber: '+919999999999',
        relationship: 'Parent',
        isPrimary: true,
      },
    });
  }

  // Create trips
  console.log('🚗 Creating trips...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const trips = await Promise.all([
    // Cab pool trip by Rahul
    prisma.trip.create({
      data: {
        createdBy: students[0].id, // Rahul
        type: TripType.cab_pool,
        status: TripStatus.open,
        originCity: 'Mumbai',
        originAddress: 'IIT Bombay Main Gate',
        originLat: new Prisma.Decimal(19.1334),
        originLng: new Prisma.Decimal(72.9133),
        destinationCity: 'Pune',
        destinationAddress: 'Pune Railway Station',
        destinationLat: new Prisma.Decimal(18.5287),
        destinationLng: new Prisma.Decimal(73.8744),
        departureDate: tomorrow,
        departureTime: new Date('2026-02-02T08:00:00'),
        departureTimeWindow: 30,
        estimatedDuration: 180,
        totalSeats: 4,
        availableSeats: 3,
        title: 'Weekend trip to Pune - Cab Pool',
        description: 'Looking for people to share a cab to Pune. Splitting the fare equally.',
        vibeTags: ['chill', 'music', 'conversation'],
        estimatedFare: new Prisma.Decimal(2000),
        farePerPerson: new Prisma.Decimal(500),
        luggageSpace: true,
        genderPreference: null,
        verifiedUsersOnly: true,
      },
    }),
    // Travel buddy trip by Priya
    prisma.trip.create({
      data: {
        createdBy: students[1].id, // Priya
        type: TripType.travel_buddy,
        status: TripStatus.open,
        originCity: 'Mumbai',
        originAddress: 'Mumbai Central Station',
        originLat: new Prisma.Decimal(18.9712),
        originLng: new Prisma.Decimal(72.8199),
        destinationCity: 'Goa',
        destinationAddress: 'Calangute Beach',
        destinationLat: new Prisma.Decimal(15.5440),
        destinationLng: new Prisma.Decimal(73.7553),
        departureDate: nextWeek,
        departureTime: new Date('2026-02-08T06:00:00'),
        departureTimeWindow: 60,
        estimatedDuration: 720,
        totalSeats: 3,
        availableSeats: 2,
        title: 'Goa Beach Trip - Looking for Travel Buddies!',
        description: 'Planning a 3-day trip to Goa. Looking for female travel companions. Will be staying at a hostel near Calangute.',
        vibeTags: ['adventure', 'beach', 'photography'],
        genderPreference: 'female',
        sameDepartmentOnly: false,
        sameYearOnly: false,
        verifiedUsersOnly: true,
      },
    }),
    // Cab pool trip by Amit
    prisma.trip.create({
      data: {
        createdBy: students[2].id, // Amit
        type: TripType.cab_pool,
        status: TripStatus.open,
        originCity: 'Delhi',
        originAddress: 'IIT Delhi Main Gate',
        originLat: new Prisma.Decimal(28.5456),
        originLng: new Prisma.Decimal(77.1934),
        destinationCity: 'Jaipur',
        destinationAddress: 'Jaipur Railway Station',
        destinationLat: new Prisma.Decimal(26.9196),
        destinationLng: new Prisma.Decimal(75.7878),
        departureDate: tomorrow,
        departureTime: new Date('2026-02-02T07:00:00'),
        departureTimeWindow: 45,
        estimatedDuration: 300,
        totalSeats: 4,
        availableSeats: 2,
        title: 'Delhi to Jaipur - Morning Ride',
        description: 'Early morning cab to Jaipur. Perfect for weekend explorers!',
        vibeTags: ['heritage', 'photography', 'food'],
        estimatedFare: new Prisma.Decimal(3500),
        farePerPerson: new Prisma.Decimal(875),
        luggageSpace: true,
        genderPreference: null,
        verifiedUsersOnly: false,
      },
    }),
    // Completed trip (for reviews)
    prisma.trip.create({
      data: {
        createdBy: students[0].id, // Rahul
        type: TripType.cab_pool,
        status: TripStatus.completed,
        originCity: 'Mumbai',
        originAddress: 'Andheri Station',
        destinationCity: 'Lonavala',
        destinationAddress: 'Lonavala Bus Stand',
        departureDate: new Date('2026-01-25'),
        departureTime: new Date('2026-01-25T09:00:00'),
        totalSeats: 4,
        availableSeats: 0,
        title: 'Lonavala Day Trip',
        description: 'Monsoon trip to Lonavala',
        vibeTags: ['nature', 'trekking'],
        estimatedFare: new Prisma.Decimal(1500),
        farePerPerson: new Prisma.Decimal(375),
      },
    }),
  ]);

  // Create swipes
  console.log('👆 Creating swipes...');
  await Promise.all([
    // Priya swipes right on Rahul's trip
    prisma.swipe.create({
      data: {
        tripId: trips[0].id,
        userId: students[1].id, // Priya
        direction: SwipeDirection.right,
        introductionMessage: 'Hey! I\'m going to Pune too. Would love to share the cab!',
      },
    }),
    // Amit swipes right on Rahul's trip
    prisma.swipe.create({
      data: {
        tripId: trips[0].id,
        userId: students[2].id, // Amit
        direction: SwipeDirection.right,
        introductionMessage: 'Count me in! I have some luggage though.',
      },
    }),
    // Sneha swipes right on Priya's Goa trip
    prisma.swipe.create({
      data: {
        tripId: trips[1].id,
        userId: students[3].id, // Sneha
        direction: SwipeDirection.right,
        introductionMessage: 'Goa sounds amazing! I\'m definitely interested 🏖️',
      },
    }),
  ]);

  // Create matches
  console.log('🤝 Creating matches...');
  const matches = await Promise.all([
    // Match between Rahul and Priya
    prisma.match.create({
      data: {
        tripId: trips[0].id,
        tripCreatorId: students[0].id, // Rahul
        matchedUserId: students[1].id, // Priya
        status: MatchStatus.accepted,
        seatsRequested: 1,
        seatsConfirmed: 1,
        fareShare: new Prisma.Decimal(500),
        paymentStatus: 'pending',
        acceptedAt: new Date(),
      },
    }),
    // Pending match between Rahul and Amit
    prisma.match.create({
      data: {
        tripId: trips[0].id,
        tripCreatorId: students[0].id, // Rahul
        matchedUserId: students[2].id, // Amit
        status: MatchStatus.pending,
        seatsRequested: 1,
      },
    }),
    // Match on completed trip (for reviews)
    prisma.match.create({
      data: {
        tripId: trips[3].id,
        tripCreatorId: students[0].id, // Rahul
        matchedUserId: students[1].id, // Priya
        status: MatchStatus.accepted,
        seatsRequested: 1,
        seatsConfirmed: 1,
        fareShare: new Prisma.Decimal(375),
        paymentStatus: 'paid',
        acceptedAt: new Date('2026-01-24'),
      },
    }),
  ]);

  // Create chat rooms and messages
  console.log('💬 Creating chat rooms and messages...');
  const chatRoom = await prisma.chatRoom.create({
    data: {
      tripId: trips[0].id,
      isActive: true,
    },
  });

  await Promise.all([
    prisma.chatMessage.create({
      data: {
        roomId: chatRoom.id,
        senderId: students[0].id, // Rahul
        messageType: 'text',
        payload: { text: 'Hey everyone! Excited for the Pune trip 🚗' },
      },
    }),
    prisma.chatMessage.create({
      data: {
        roomId: chatRoom.id,
        senderId: students[1].id, // Priya
        messageType: 'text',
        payload: { text: 'Same here! What time should we meet at the gate?' },
      },
    }),
    prisma.chatMessage.create({
      data: {
        roomId: chatRoom.id,
        senderId: students[0].id, // Rahul
        messageType: 'text',
        payload: { text: 'Let\'s meet at 7:45 AM. The cab will arrive at 8.' },
      },
    }),
  ]);

  // Create reviews
  console.log('⭐ Creating reviews...');
  await Promise.all([
    // Priya reviews Rahul (from completed trip)
    prisma.review.create({
      data: {
        tripId: trips[3].id,
        reviewerId: students[1].id, // Priya
        reviewedUserId: students[0].id, // Rahul
        type: ReviewType.companion,
        overallRating: new Prisma.Decimal(4.5),
        punctualityRating: new Prisma.Decimal(5.0),
        planningRating: new Prisma.Decimal(4.5),
        coordinationRating: new Prisma.Decimal(4.0),
        positiveTags: ['punctual', 'friendly', 'good_planner'],
        comment: 'Great trip! Rahul was very organized and the trip went smoothly.',
        isVerified: true,
        isPublic: true,
      },
    }),
    // Rahul reviews Priya
    prisma.review.create({
      data: {
        tripId: trips[3].id,
        reviewerId: students[0].id, // Rahul
        reviewedUserId: students[1].id, // Priya
        type: ReviewType.companion,
        overallRating: new Prisma.Decimal(5.0),
        punctualityRating: new Prisma.Decimal(5.0),
        coordinationRating: new Prisma.Decimal(5.0),
        positiveTags: ['fun_company', 'punctual', 'good_conversation'],
        comment: 'Priya was amazing! Made the journey so much fun.',
        isVerified: true,
        isPublic: true,
      },
    }),
  ]);

  // Create a sample safety report
  console.log('🚨 Creating sample safety report...');
  await prisma.safetyReport.create({
    data: {
      reporterId: students[3].id, // Sneha
      type: ReportType.user,
      reportedUserId: students[4].id, // Karan
      reason: 'inappropriate_behavior',
      description: 'This is a test report for demo purposes.',
      status: ReportStatus.pending,
      isEmergency: false,
    },
  });

  // Create notifications
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: students[0].id, // Rahul
        type: NotificationType.match_confirmed,
        title: 'New Match!',
        message: 'Priya has matched with your Pune trip.',
        matchId: matches[0].id,
        tripId: trips[0].id,
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[0].id, // Rahul
        type: NotificationType.swipe_received,
        title: 'New Interest',
        message: 'Someone is interested in your trip!',
        tripId: trips[0].id,
        isRead: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[1].id, // Priya
        type: NotificationType.chat_message,
        title: 'New Message',
        message: 'Rahul sent a message in the trip chat.',
        tripId: trips[0].id,
        isRead: false,
      },
    }),
  ]);

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Test Accounts (password: password123)');
  console.log('=========================================');
  console.log('Admin:    admin@iitb.ac.in');
  console.log('Student:  rahul@iitb.ac.in');
  console.log('Student:  priya@iitb.ac.in');
  console.log('Student:  amit@iitd.ac.in');
  console.log('Student:  sneha@bits-pilani.ac.in');
  console.log('Student:  karan@vit.ac.in (unverified)');
  console.log('');
  console.log('🚗 Sample Trips Created:');
  console.log('- Mumbai → Pune (Cab Pool) by Rahul');
  console.log('- Mumbai → Goa (Travel Buddy) by Priya');
  console.log('- Delhi → Jaipur (Cab Pool) by Amit');
  console.log('- Mumbai → Lonavala (Completed) by Rahul');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
