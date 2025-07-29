# Bi Lắc Stats

Ứng dụng web quản lý kết quả chơi bi lắc với Supabase.

## Tính năng

- 📊 Thống kê người chơi (số trận thắng, tỉ lệ thắng, tổng điểm, số trận)
- 📝 Thêm trận đấu mới
- 📋 Lịch sử trận đấu
- 🏆 Xếp hạng người chơi
- 📱 Responsive design

## Thiết lập

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Thiết lập Supabase

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào SQL Editor và chạy script sau để tạo bảng:

```sql
CREATE TABLE matches (
  id BIGSERIAL PRIMARY KEY,
  team1_player1 TEXT NOT NULL,
  team1_player2 TEXT NOT NULL,
  team2_player1 TEXT NOT NULL,
  team2_player2 TEXT NOT NULL,
  team1_score INTEGER NOT NULL,
  team2_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm dữ liệu mẫu
INSERT INTO matches (team1_player1, team1_player2, team2_player1, team2_player2, team1_score, team2_score) VALUES
('Thành', 'Hải', 'Cương', 'Sơn', 100, 0),
('Thành', 'Hải', 'Quang', 'Tuấn', 50, 0),
('Hải', 'Quang', 'Cương', 'Sơn', 50, 0),
('Hải', 'Tuấn', 'Cương', 'Sơn', 150, 0),
('Tuấn', 'Hải', 'Sơn', 'Thành', 0, 50);
```

4. Vào Settings > API để lấy URL và Anon Key
5. Tạo file `.env.local` với nội dung:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Chạy ứng dụng

```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
src/
├── app/
│   ├── page.tsx          # Trang chính
│   ├── layout.tsx        # Layout
│   └── globals.css       # CSS toàn cục
├── components/
│   ├── StatsCard.tsx     # Card thống kê người chơi
│   ├── MatchList.tsx     # Danh sách trận đấu
│   └── AddMatchForm.tsx  # Form thêm trận đấu
├── hooks/
│   └── useStats.ts       # Hook tính toán thống kê
└── lib/
    └── supabase.ts       # Cấu hình Supabase
```

## Công nghệ sử dụng

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database và backend
- **Lucide React** - Icons
