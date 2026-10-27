// scripts/backup-db.js - Script sao lưu cơ sở dữ liệu PostgreSQL
// Chạy lệnh: npm run db:backup
// Ưu tiên dùng pg_dump; nếu máy chưa cài PostgreSQL Client thì tự động xuất SQL qua Prisma

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Lỗi: Chưa cấu hình DATABASE_URL trong file backend/.env');
  process.exit(1);
}

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().slice(0, 10);
const outputFile = path.join(backupDir, `hotelcare_backup_${timestamp}.sql`);
const latestFile = path.join(backupDir, 'hotelcare_backup_latest.sql');

// Hàm escape chuỗi SQL an toàn
function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function backupWithPrisma() {
  const prisma = require('../src/prisma/prisma');
  try {
    const [users, rooms, categories, stays, requests, history, feedbacks, ratings] = await Promise.all([
      prisma.user.findMany({ orderBy: { id: 'asc' } }),
      prisma.room.findMany({ orderBy: { id: 'asc' } }),
      prisma.serviceCategory.findMany({ orderBy: { id: 'asc' } }),
      prisma.stay.findMany({ orderBy: { id: 'asc' } }),
      prisma.serviceRequest.findMany({ orderBy: { id: 'asc' } }),
      prisma.requestHistory.findMany({ orderBy: { id: 'asc' } }),
      prisma.feedback.findMany({ orderBy: { id: 'asc' } }),
      prisma.rating.findMany({ orderBy: { id: 'asc' } }),
    ]);

    let sql = `-- HotelCarePortal PostgreSQL Database Backup\n`;
    sql += `-- Ngày tạo: ${new Date().toISOString()}\n`;
    sql += `-- Công cụ: pg_dump / Prisma SQL Exporter\n\n`;

    const writeTable = (tableName, rows) => {
      sql += `-- Bảng: ${tableName} (${rows.length} bản ghi)\n`;
      for (const row of rows) {
        const cols = Object.keys(row).map((c) => `"${c}"`).join(', ');
        const vals = Object.values(row).map(sqlVal).join(', ');
        sql += `INSERT INTO "${tableName}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
      }
      sql += '\n';
    };

    writeTable('users', users);
    writeTable('rooms', rooms);
    writeTable('service_categories', categories);
    writeTable('stays', stays);
    writeTable('service_requests', requests);
    writeTable('request_history', history);
    writeTable('feedbacks', feedbacks);
    writeTable('ratings', ratings);

    fs.writeFileSync(outputFile, sql, 'utf8');
    fs.writeFileSync(latestFile, sql, 'utf8');

    console.log(`✅ Sao lưu thành công (${users.length} users, ${requests.length} requests, ${feedbacks.length} feedbacks)!`);
    console.log(`📁 File theo ngày : backups/${path.basename(outputFile)}`);
    console.log(`📁 File mới nhất  : backups/hotelcare_backup_latest.sql`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('⏳ Đang sao lưu cơ sở dữ liệu PostgreSQL...');
  try {
    // Thử gọi pg_dump nếu máy có cài sẵn PostgreSQL Client Tools
    execFileSync(
      'pg_dump',
      ['--dbname', dbUrl, '--no-owner', '--no-privileges', '--clean', '--if-exists', '--file', outputFile],
      { stdio: 'ignore' }
    );
    fs.copyFileSync(outputFile, latestFile);
    console.log(`✅ Sao lưu bằng pg_dump thành công! File: backups/${path.basename(outputFile)}`);
  } catch {
    // Máy không cài pg_dump -> Tự động xuất file .sql qua kết nối Prisma
    console.log('ℹ️  Máy chưa cài pg_dump trong PATH → Tự động xuất bản sao lưu .sql trực tiếp từ Neon DB...');
    await backupWithPrisma();
  }
}

main().catch((err) => {
  console.error('❌ Lỗi khi sao lưu database:', err.message);
  process.exit(1);
});
