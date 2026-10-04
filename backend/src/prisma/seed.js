// seed.js - Script tạo dữ liệu mẫu
// Chạy: npx prisma db seed
// Tạo: 4 tài khoản demo, 10 phòng, 20 yêu cầu dịch vụ, 5 góp ý

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

  // ===== 1. XÓA DỮ LIỆU CŨ (theo thứ tự để tránh lỗi foreign key) =====
  await prisma.rating.deleteMany();
  await prisma.requestHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Đã xóa dữ liệu cũ');

  // ===== 2. TẠO NGƯỜI DÙNG MẪU (mật khẩu mặc định: Demo@123) =====
  const passwordHash = await bcrypt.hash('Demo@123', 10);

  const [guest, receptionist, staff, manager] = await Promise.all([
    prisma.user.create({
      data: {
        full_name: 'Nguyễn Văn An',
        email: 'guest@demo.com',
        password_hash: passwordHash,
        role: 'GUEST',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Trần Thị Bình',
        email: 'receptionist@demo.com',
        password_hash: passwordHash,
        role: 'RECEPTIONIST',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Lê Văn Cường',
        email: 'staff@demo.com',
        password_hash: passwordHash,
        role: 'STAFF',
      },
    }),
    prisma.user.create({
      data: {
        full_name: 'Phạm Thị Dung',
        email: 'manager@demo.com',
        password_hash: passwordHash,
        role: 'MANAGER',
      },
    }),
  ]);

  console.log('✅ Đã tạo 4 tài khoản demo');

  // ===== 3. TẠO 10 PHÒNG =====
  const roomsData = [
    { room_number: '101', floor: 1, type: 'STANDARD', status: 'OCCUPIED' },
    { room_number: '102', floor: 1, type: 'STANDARD', status: 'AVAILABLE' },
    { room_number: '103', floor: 1, type: 'STANDARD', status: 'AVAILABLE' },
    { room_number: '201', floor: 2, type: 'DELUXE', status: 'OCCUPIED' },
    { room_number: '202', floor: 2, type: 'DELUXE', status: 'AVAILABLE' },
    { room_number: '203', floor: 2, type: 'DELUXE', status: 'MAINTENANCE' },
    { room_number: '301', floor: 3, type: 'SUITE', status: 'OCCUPIED' },
    { room_number: '302', floor: 3, type: 'SUITE', status: 'AVAILABLE' },
    { room_number: '401', floor: 4, type: 'FAMILY', status: 'OCCUPIED' },
    { room_number: '402', floor: 4, type: 'FAMILY', status: 'AVAILABLE' },
  ];

  const rooms = await Promise.all(
    roomsData.map((r) => prisma.room.create({ data: r }))
  );

  console.log('✅ Đã tạo 10 phòng');

  // ===== 4. TẠO DANH MỤC DỊCH VỤ =====
  const [catFood, catRoom, catTech, catSpa, catTransport] = await Promise.all([
    prisma.serviceCategory.create({
      data: { name: 'Ăn uống & Đồ uống', description: 'Order đồ ăn, thức uống về phòng' },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Tiện nghi phòng', description: 'Thêm gối, chăn, khăn tắm, dọn phòng' },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Kỹ thuật', description: 'Sửa điều hòa, TV, wifi, ổ điện' },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Spa & Sức khỏe', description: 'Massage, xông hơi, tập gym' },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Vận chuyển', description: 'Taxi, xe đưa đón sân bay, thuê xe' },
    }),
  ]);

  console.log('✅ Đã tạo 5 danh mục dịch vụ');

  // ===== 5. TẠO CÁC LẦN LƯU TRÚ MẪU =====
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() - 2); // Check-in 2 ngày trước

  const checkOut = new Date(today);
  checkOut.setDate(today.getDate() + 3); // Check-out 3 ngày sau

  // Tạo 3 stay cho khách demo
  const [stay1, stay2, stay3] = await Promise.all([
    prisma.stay.create({
      data: {
        guest_id: guest.id,
        room_id: rooms[0].id, // Phòng 101
        check_in: checkIn,
        check_out: checkOut,
      },
    }),
    prisma.stay.create({
      data: {
        guest_id: guest.id,
        room_id: rooms[3].id, // Phòng 201
        check_in: new Date('2026-09-01'),
        check_out: new Date('2026-09-05'),
      },
    }),
    // Stay cho user khác (giả lập)
    prisma.stay.create({
      data: {
        guest_id: receptionist.id, // Lễ tân cũng có lần ở (test)
        room_id: rooms[6].id, // Phòng 301
        check_in: checkIn,
        check_out: checkOut,
      },
    }),
  ]);

  console.log('✅ Đã tạo các lần lưu trú mẫu');

  // ===== 6. TẠO 20 YÊU CẦU DỊCH VỤ MẪU =====
  const requestsData = [
    // Stay hiện tại của guest - các yêu cầu với nhiều trạng thái khác nhau
    { stay_id: stay1.id, category_id: catFood.id, content: 'Cho tôi 1 bữa sáng kiểu Âu và 2 ly cà phê đen', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay1.id, category_id: catRoom.id, content: 'Thêm 2 chiếc gối mềm và 1 bộ khăn tắm sạch', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay1.id, category_id: catTech.id, content: 'Điều hòa phòng bị hỏng, không mát', status: 'DA_PHAN_CONG', assigned_to: staff.id },
    { stay_id: stay1.id, category_id: catSpa.id, content: 'Đặt lịch massage toàn thân 60 phút lúc 15:00 hôm nay', status: 'DANG_XU_LY', assigned_to: staff.id },
    { stay_id: stay1.id, category_id: catFood.id, content: 'Gọi 1 set bữa tối seafood và 1 chai vang đỏ', status: 'MOI', assigned_to: null },
    { stay_id: stay1.id, category_id: catTransport.id, content: 'Cần taxi ra sân bay Tân Sơn Nhất lúc 6:00 sáng mai', status: 'MOI', assigned_to: null },
    { stay_id: stay1.id, category_id: catRoom.id, content: 'Dọn phòng và thay toàn bộ ga trải giường', status: 'DA_PHAN_CONG', assigned_to: staff.id },
    { stay_id: stay1.id, category_id: catTech.id, content: 'Wifi phòng bắt không ổn định, hay mất kết nối', status: 'DANG_XU_LY', assigned_to: staff.id },

    // Stay cũ (đã check-out)
    { stay_id: stay2.id, category_id: catFood.id, content: 'Gọi bánh mì và nước cam buổi sáng', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay2.id, category_id: catSpa.id, content: 'Đặt xông hơi thảo dược buổi chiều', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay2.id, category_id: catRoom.id, content: 'Cần thêm chăn vì phòng quá lạnh', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay2.id, category_id: catTech.id, content: 'TV không bật được, remote hỏng pin', status: 'HOAN_TAT', assigned_to: staff.id },

    // Stay của người khác
    { stay_id: stay3.id, category_id: catFood.id, content: 'Gọi phở bò và cà phê sữa đá', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay3.id, category_id: catTransport.id, content: 'Đặt xe đón tại sân bay lúc 14:00', status: 'HOAN_TAT', assigned_to: staff.id },
    { stay_id: stay3.id, category_id: catSpa.id, content: 'Massage thư giãn đôi 90 phút', status: 'DANG_XU_LY', assigned_to: staff.id },
    { stay_id: stay3.id, category_id: catRoom.id, content: 'Cần thêm bàn làm việc và đèn đọc sách', status: 'DA_PHAN_CONG', assigned_to: staff.id },
    { stay_id: stay3.id, category_id: catTech.id, content: 'Ổ cắm điện cạnh giường bị hỏng', status: 'MOI', assigned_to: null },
    { stay_id: stay3.id, category_id: catFood.id, content: 'Gọi trái cây tươi theo mùa', status: 'MOI', assigned_to: null },
    { stay_id: stay3.id, category_id: catRoom.id, content: 'Đổi phòng vì view không tốt như cam kết', status: 'DA_HUY', assigned_to: null },
    { stay_id: stay3.id, category_id: catSpa.id, content: 'Đăng ký thẻ tập gym 3 ngày', status: 'HOAN_TAT', assigned_to: staff.id },
  ];

  // Tính ngày hoàn thành cho các yêu cầu đã xong
  const completedAt = new Date(today);
  completedAt.setHours(today.getHours() - 2);

  const createdRequests = [];
  for (const req of requestsData) {
    const created = await prisma.serviceRequest.create({
      data: {
        ...req,
        completed_at: req.status === 'HOAN_TAT' ? completedAt : null,
      },
    });
    createdRequests.push(created);
  }

  console.log('✅ Đã tạo 20 yêu cầu dịch vụ mẫu');

  // ===== 7. TẠO LỊCH SỬ THAY ĐỔI TRẠNG THÁI =====
  // Tạo mẫu cho 1 yêu cầu hoàn chỉnh
  const completedReq = createdRequests[0]; // Yêu cầu HOAN_TAT đầu tiên
  await prisma.requestHistory.createMany({
    data: [
      { request_id: completedReq.id, old_status: null, new_status: 'MOI', changed_by: guest.id, changed_at: new Date('2026-10-03T08:00:00') },
      { request_id: completedReq.id, old_status: 'MOI', new_status: 'DA_PHAN_CONG', changed_by: receptionist.id, changed_at: new Date('2026-10-03T08:30:00') },
      { request_id: completedReq.id, old_status: 'DA_PHAN_CONG', new_status: 'DANG_XU_LY', changed_by: staff.id, changed_at: new Date('2026-10-03T09:00:00') },
      { request_id: completedReq.id, old_status: 'DANG_XU_LY', new_status: 'HOAN_TAT', changed_by: staff.id, changed_at: new Date('2026-10-03T10:00:00') },
    ],
  });

  console.log('✅ Đã tạo lịch sử thay đổi trạng thái mẫu');

  // ===== 8. TẠO ĐÁNH GIÁ CHO CÁC YÊU CẦU ĐÃ HOÀN THÀNH =====
  const completedRequestsForRating = createdRequests.filter(
    (r) => r.status === 'HOAN_TAT'
  );

  const ratingsData = [
    { score: 5, comment: 'Dịch vụ tuyệt vời, phục vụ nhanh và chu đáo!' },
    { score: 4, comment: 'Khá tốt, nhân viên thân thiện.' },
    { score: 5, comment: 'Hoàn hảo, sẽ quay lại lần sau!' },
    { score: 3, comment: 'Tạm được, hơi chậm một chút.' },
    { score: 4, comment: 'Hài lòng với dịch vụ này.' },
    { score: 5, comment: 'Rất chuyên nghiệp!' },
    { score: 4, comment: 'Tốt, xứng đáng với mức giá.' },
  ];

  for (let i = 0; i < Math.min(ratingsData.length, completedRequestsForRating.length); i++) {
    const req = completedRequestsForRating[i];
    // Xác định guest_id từ stay
    const stay = await prisma.stay.findUnique({ where: { id: req.stay_id } });
    await prisma.rating.create({
      data: {
        request_id: req.id,
        guest_id: stay.guest_id,
        score: ratingsData[i].score,
        comment: ratingsData[i].comment,
      },
    });
  }

  console.log('✅ Đã tạo đánh giá mẫu');

  // ===== 9. TẠO 5 GÓP Ý / KHIẾU NẠI MẪU =====
  const feedbacksData = [
    {
      guest_id: guest.id,
      type: 'GOP_Y',
      content: 'Buffet sáng nên thêm các món ăn truyền thống Việt Nam như bánh mì, hủ tiếu.',
      status: 'DA_GIAI_QUYET',
      response: 'Cảm ơn góp ý của quý khách. Chúng tôi sẽ bổ sung thực đơn trong tuần tới.',
      handled_by: manager.id,
    },
    {
      guest_id: guest.id,
      type: 'KHIEU_NAI',
      content: 'Phòng bên cạnh quá ồn vào ban đêm, không thể ngủ được.',
      status: 'DA_GIAI_QUYET',
      response: 'Xin lỗi quý khách vì sự bất tiện này. Chúng tôi đã nhắc nhở khách phòng bên. Chúng tôi sẽ bổ sung phòng cách âm trong đợt nâng cấp tới.',
      handled_by: manager.id,
    },
    {
      guest_id: guest.id,
      type: 'GOP_Y',
      content: 'Hồ bơi nên mở cửa đến 22h thay vì 20h như hiện tại.',
      status: 'DANG_XU_LY',
      response: null,
      handled_by: null,
    },
    {
      guest_id: receptionist.id,
      type: 'KHIEU_NAI',
      content: 'Dịch vụ phòng chậm hơn 1 tiếng so với cam kết 30 phút.',
      status: 'MOI',
      response: null,
      handled_by: null,
    },
    {
      guest_id: receptionist.id,
      type: 'GOP_Y',
      content: 'Nên có app điện thoại để đặt dịch vụ tiện hơn.',
      status: 'MOI',
      response: null,
      handled_by: null,
    },
  ];

  await Promise.all(
    feedbacksData.map((f) => prisma.feedback.create({ data: f }))
  );

  console.log('✅ Đã tạo 5 góp ý / khiếu nại mẫu');

  // ===== TỔNG KẾT =====
  console.log('\n🎉 Seed thành công! Tài khoản demo:');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Vai trò       │ Email                      │ Mật khẩu   │');
  console.log('│─────────────────────────────────────────────│');
  console.log('│  Guest         │ guest@demo.com             │ Demo@123   │');
  console.log('│  Lễ tân        │ receptionist@demo.com      │ Demo@123   │');
  console.log('│  Nhân viên     │ staff@demo.com             │ Demo@123   │');
  console.log('│  Quản lý       │ manager@demo.com           │ Demo@123   │');
  console.log('└─────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
