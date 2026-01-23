import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import BookingSidebar from '@/components/features/BookingSidebar';

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

// Map amenity names to Material Symbols icons
const amenityIcons: Record<string, string> = {
  'wifi': 'wifi',
  'kitchen': 'kitchen',
  'air conditioning': 'ac_unit',
  'ac': 'ac_unit',
  'parking': 'local_parking',
  'tv': 'tv',
  'balcony': 'balcony',
  'pool': 'pool',
  'gym': 'fitness_center',
  'washer': 'local_laundry_service',
  'dryer': 'dry_cleaning',
  'heating': 'heat',
  'workspace': 'desktop_windows',
  'breakfast': 'restaurant',
  'elevator': 'elevator',
  'security': 'security',
  'garden': 'yard',
  'bbq': 'outdoor_grill',
  'fireplace': 'fireplace',
  'hot tub': 'hot_tub',
};

function getAmenityIcon(amenity: string): string {
  const lowerAmenity = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (lowerAmenity.includes(key)) return icon;
  }
  return 'check_circle';
}

async function getRoom(id: string) {
  try {
    await connectDB();
    const room = await Room.findById(id).lean();
    return room ? JSON.parse(JSON.stringify(room)) : null;
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return null;
  }
}

export async function generateMetadata({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await getRoom(id);
  return {
    title: room ? `${room.name} | StayEasy` : 'Room Not Found',
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  return (
    <main className="container mx-auto px-6 py-10 bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <div className="w-full flex flex-col lg:flex-row lg:gap-24">
        {/* Left Column: Room Details */}
        <div className="lg:w-2/3">
          {/* Headline & Meta */}
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {room.name}
            </h1>
            <p className="mt-2 text-base font-normal opacity-60">
              {room.capacity} khách · 1 phòng ngủ · 1 giường · 1 phòng tắm
            </p>
          </div>

          {/* Image Grid */}
          <div className="mt-6 grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
            {/* Main Image */}
            <div className="col-span-2 row-span-2 lg:col-span-1 lg:row-span-2 relative rounded-xl overflow-hidden">
              {room.images?.[0] ? (
                <Image
                  src={room.images[0]}
                  alt={`${room.name} - Main view`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl opacity-30">image</span>
                </div>
              )}
            </div>
            {/* Secondary Images */}
            <div className="hidden lg:block col-span-1 row-span-1 relative rounded-xl overflow-hidden">
              {room.images?.[1] ? (
                <Image
                  src={room.images[1]}
                  alt={`${room.name} - View 2`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl opacity-30">image</span>
                </div>
              )}
            </div>
            <div className="hidden lg:block col-span-1 row-span-1 relative rounded-xl overflow-hidden">
              {room.images?.[2] ? (
                <Image
                  src={room.images[2]}
                  alt={`${room.name} - View 3`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl opacity-30">image</span>
                </div>
              )}
            </div>
          </div>

          {/* Room Info Section */}
          <div className="mt-12">
            <div className="flex justify-between items-start pb-6 border-b border-primary/10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Toàn bộ nơi ở do StayEasy quản lý
                </h2>
                <p className="mt-2 opacity-80">
                  {room.description}
                </p>
              </div>
              <div className="bg-primary/10 rounded-full size-14 flex-shrink-0 ml-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="mt-8 pb-8 border-b border-primary/10">
            <h3 className="text-xl font-black uppercase tracking-tight">
              Tiện nghi
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6">
              {room.amenities?.map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl opacity-80">
                    {getAmenityIcon(amenity)}
                  </span>
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-xl font-black uppercase tracking-tight">
              Đánh giá
            </h3>
            <div className="flex items-center gap-2 mt-4">
              <span className="material-symbols-outlined text-2xl text-highlight">star</span>
              <span className="font-bold text-lg">4.92</span>
              <span className="opacity-60">(128 đánh giá)</span>
            </div>
            <div className="mt-6 space-y-6">
              {/* Sample Review 1 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-bold">Nguyen Van A</p>
                    <p className="text-sm opacity-60">Tháng 12, 2025</p>
                  </div>
                </div>
                <p className="opacity-80">
                  &quot;Phòng rất đẹp và sạch sẽ. Chủ nhà rất thân thiện và hỗ trợ nhiệt tình. Sẽ quay lại lần sau!&quot;
                </p>
              </div>
              {/* Sample Review 2 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-bold">Tran Thi B</p>
                    <p className="text-sm opacity-60">Tháng 11, 2025</p>
                  </div>
                </div>
                <p className="opacity-80">
                  &quot;Vị trí tuyệt vời, gần trung tâm. Tiện nghi đầy đủ, giá cả hợp lý.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Sidebar */}
        <div className="lg:w-1/3 relative mt-12 lg:mt-0">
          <BookingSidebar room={room} />
        </div>
      </div>
    </main>
  );
}
