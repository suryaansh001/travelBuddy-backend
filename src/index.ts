import app from './app.js';
import { config } from './config/env.js';
import { prisma, disconnectDatabase } from './config/database.js';
import { redis, disconnectRedis } from './config/redis.js';

const PORT = config.PORT;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// For Vercel serverless: Export app for serverless function
export default app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  startServer();
}

