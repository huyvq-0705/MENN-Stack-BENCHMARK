export default async function handler(req, res) {
  const { path, secret } = req.query;

  // 1. Kiểm tra mã bảo mật (Shared Secret)
  if (secret !== process.env.NEXTJS_REVALIDATE_TOKEN) {
    return res.status(401).json({ message: 'Mã xác thực không hợp lệ' });
  }

  // 2. CHỐT CHẶN: Nếu yêu cầu làm mới trang SSG, hãy từ chối ngay
  if (path === '/ssg/homepage') {
    console.log("🛡️ Chặn lệnh làm mới trang SSG để giữ trạng thái hóa thạch.");
    return res.status(200).json({ 
      revalidated: false, 
      message: 'Trang này được cấu hình SSG thuần túy, không được phép cập nhật dữ liệu.' 
    });
  }

  try {
    // Chỉ cho phép revalidate các trang khác (ví dụ trang chủ / hoặc trang bài viết)
    await res.revalidate(path);
    return res.json({ revalidated: true, message: `Đã làm mới thành công: ${path}` });
  } catch (err) {
    return res.status(500).send('Lỗi trong quá trình làm mới trang (ISR Error)');
  }
}