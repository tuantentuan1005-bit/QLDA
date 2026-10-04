// prisma.js - Singleton Prisma Client
// Tránh tạo nhiều kết nối trong môi trường development (hot-reload)

const { PrismaClient } = require('@prisma/client');

// Dùng biến global để tái sử dụng kết nối khi nodemon reload
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
