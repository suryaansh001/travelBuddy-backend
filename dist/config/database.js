import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/campusbuddy';
// For Vercel/serverless: Use connection pooling with smaller pool size
const pool = new pg.Pool({
    connectionString,
    max: 10, // Smaller pool for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['error', 'warn']
            : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
// Graceful shutdown for connection cleanup
export async function disconnectDatabase() {
    await prisma.$disconnect();
    await pool.end();
}
//# sourceMappingURL=database.js.map