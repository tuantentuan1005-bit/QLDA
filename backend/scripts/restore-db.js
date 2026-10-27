// scripts/restore-db.js - Script khôi phục cơ sở dữ liệu PostgreSQL từ file .sql
// Chạy lệnh: npm run db:restore (mặc định dùng backups/hotelcare_backup_latest.sql)
// Hoặc:     npm run db:restore -- backups/<ten-file-backup>.sql

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Lỗi: Chưa cấu hình DATABASE_URL trong file backend/.env');
  process.exit(1);
}

// Nếu không truyền tên file thì mặc định lấy file backup mới nhất
const defaultFile = path.join(__dirname, '../backups/hotelcare_backup_latest.sql');
const inputArg = process.argv[2];
const inputFile = inputArg ? path.resolve(process.cwd(), inputArg) : defaultFile;

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Không tìm thấy file backup: ${inputFile}`);
  console.error('👉 Hãy chạy lệnh "npm run db:backup" trước để tạo file sao lưu.');
  process.exit(1);
}

async function restoreWithPrisma() {
  const prisma = require('../src/prisma/prisma');
  try {
    const sqlContent = fs.readFileSync(inputFile, 'utf8');
    const statements = sqlContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('INSERT INTO'));

    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log(`✅ Khôi phục thành công (${statements.length} câu lệnh SQL đã thực thi)!`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log(`⏳ Đang khôi phục cơ sở dữ liệu từ file: backups/${path.basename(inputFile)}...`);
  try {
    execFileSync('psql', ['--dbname', dbUrl, '--file', inputFile], { stdio: 'ignore' });
    console.log('✅ Khôi phục bằng psql thành công!');
  } catch {
    console.log('ℹ️  Máy chưa cài psql trong PATH → Tự động nạp file .sql qua Prisma...');
    await restoreWithPrisma();
  }
}

main().catch((err) => {
  console.error('❌ Lỗi khi khôi phục database:', err.message);
  process.exit(1);
});
