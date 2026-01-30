import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';

/**
 * Da Lat Homestay Seed Data
 * Authentic homestays with real Da Lat locations and amenities
 */
const mockRooms = [
  {
    name: 'Villa Hoàng Sơn - Đà Lạt',
    description: 'Biệt thự kiểu Pháp giữa lòng Đà Lạt với vườn hoa rực rỡ, view thành phố tuyệt đẹp. Cách Hồ Xuân Hương chỉ 5 phút đi bộ.',
    price: 2800000,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 4,
    amenities: ['Wifi', 'Lò sưởi', 'Vườn hoa', 'Bếp chung', 'Bãi đỗ xe', 'View thành phố'],
    available: true,
    address: '42 Hoàng Hoa Thám, Phường 10',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9404,
    longitude: 108.4380,
  },
  {
    name: 'The SHADOW - Container Homestay',
    description: 'Homestay độc đáo từ container tái chế, phong cách industrial chill. Điểm check-in hot nhất Đà Lạt hiện nay.',
    price: 1500000,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'Máy sưởi', 'Đồ uống chào mừng', 'Photo corner', 'Xe đạp cho thuê'],
    available: true,
    address: '15 Đường Yersin, Phường 10',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9369,
    longitude: 108.4419,
  },
  {
    name: 'Mê Linh Coffee Garden',
    description: 'Homestay nằm trong vườn cà phê Mê Linh huyền thoại. Sáng đi bộ giữa hàng cà phê xanh mướt, tận hưởng không khí mùa xuân quanh năm.',
    price: 2200000,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 3,
    amenities: ['Wifi', 'Phòng có ban công', 'Vườn cà phê', 'Breakfast', 'Tour cà phê'],
    available: true,
    address: 'Tổ 20, Thôn Đa Thiện 1, Xã Xuân Thọ',
    city: 'Đà Lạt',
    district: 'Xuân Thọ',
    latitude: 11.8833,
    longitude: 108.4667,
  },
  {
    name: 'Balo\'s House - Japanese Style',
    description: 'Homestay phong cách Nhật Bản giữa Đà Lạt mộng mơ. Tatami, shoji, và không gian thiền định cho những ai cần tĩnh lặng.',
    price: 1800000,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'Máy sưởi', 'Tatami', 'Trà đạo', 'Sách Nhật', 'Vườn Nhật'],
    available: true,
    address: '88 Hai Bà Trưng, Phường 6',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9416,
    longitude: 108.4352,
  },
  {
    name: 'Nơi Này Có Hoa - Garden House',
    description: 'Nhà vườn đầy hoa với hàng trăm loài hoa Đà Lạt. Mỗi góc nhà đều là background sống ảo cực chất.',
    price: 1600000,
    images: [
      'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'Máy sưởi', 'Vườn hoa', 'Chòi gỗ', 'Nướng BBQ', 'Hoạt động dã ngoại'],
    available: true,
    address: '25 Đường Nguyễn Chí Thanh, Phường 9',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9453,
    longitude: 108.4298,
  },
  {
    name: 'Datanla Riverside - Forest Camp',
    description: 'Homestay ven suối Datanla giữa rừng thông bạt ngàn. Trải nghiệm camping glamping đỉnh cao, nghe tiếng suối chảy suốt đêm.',
    price: 3500000,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 6,
    amenities: ['Wifi', 'Lều glamping', 'Suối riêng', 'Team building', 'ATV tour', 'Breakfast'],
    available: true,
    address: 'Suối Vàng, Phường 3',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9067,
    longitude: 108.4375,
  },
  {
    name: 'Đà Lạt Milk Village',
    description: 'Homestay theo theme trang trại bò sữa, ngay cạnh đồi bò với view đồi cỏ hồng siêu đẹp. Sữa tươi nóng mỗi sáng.',
    price: 2000000,
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 4,
    amenities: ['Wifi', 'Máy sưởi', 'Đồi cỏ', 'Sữa tươi', 'Cưỡi ngựa', 'Chụp hình farm'],
    available: true,
    address: 'Đường đèo Prenn, Phường 3',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9150,
    longitude: 108.4450,
  },
  {
    name: 'Làng Anh Đào - Cherry Blossom House',
    description: 'Homestay vườn anh đào với hàng câyakura Đà Lạt. Mùa hoa nở rộ như Nhật Bản thu nhỏ giữa cao nguyên.',
    price: 2500000,
    images: [
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 4,
    amenities: ['Wifi', 'Lò sưởi', 'Vườn anh đào', 'Tea house', 'Xe ô tô cổ', 'Guided tour'],
    available: true,
    address: '12 Đường Đào Tấn, Phường 11',
    city: 'Đà Lạt',
    district: 'TP. Đà Lạt',
    latitude: 11.9350,
    longitude: 108.4280,
  },
];

/**
 * DELETE /api/seed - Delete all rooms and reseed with Da Lat homestays
 */
export async function DELETE() {
  try {
    await connectDB();
    
    // Delete all existing rooms
    await Room.deleteMany({});
    
    // Insert new Da Lat homestay data
    const rooms = await Room.insertMany(mockRooms);
    
    return NextResponse.json({ 
      message: 'Đã cập nhật dữ liệu homestay Đà Lạt',
      count: rooms.length,
      rooms: rooms.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}

/**
 * POST /api/seed - Seed rooms if not exists
 */
export async function POST() {
  try {
    await connectDB();
    
    // Check if rooms already exist
    const existingRooms = await Room.countDocuments();
    if (existingRooms > 0) {
      return NextResponse.json({ 
        message: 'Rooms already exist. Use DELETE to reseed.', 
        count: existingRooms 
      });
    }

    // Seed rooms
    const rooms = await Room.insertMany(mockRooms);
    
    return NextResponse.json({ 
      message: 'Seeded successfully', 
      rooms: rooms.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}

/**
 * GET /api/seed - Get current rooms or auto seed
 */
export async function GET() {
  try {
    await connectDB();
    
    const rooms = await Room.find();
    
    if (rooms.length === 0) {
      // Auto seed if no rooms
      const seededRooms = await Room.insertMany(mockRooms);
      return NextResponse.json({ 
        message: 'Auto seeded', 
        count: seededRooms.length,
        rooms: seededRooms.map(r => r.toJSON())
      });
    }
    
    return NextResponse.json({ 
      message: 'Rooms exist', 
      count: rooms.length,
      rooms: rooms.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('Get Rooms Error:', error);
    return NextResponse.json({ error: 'Failed to get rooms' }, { status: 500 });
  }
}
