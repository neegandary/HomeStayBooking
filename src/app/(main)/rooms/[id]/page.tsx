import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Room from '@/models/Room';
import BookingSidebar from '@/components/features/BookingSidebar';
import { RatingSummary, ReviewList } from '@/components/reviews';
import { Map } from '@/components/map';

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

async function getRoomWithReviews(id: string) {
  try {
    await connectDB();
    const room = await Room.findOne({
      _id: id,
      deleted: { $ne: true },
    }).lean();

    if (!room) {
      return null;
    }

    // Fetch reviews for this room
    const Review = (await import('@/models/Review')).default;
    const reviews = await Review.find({
      roomId: id,
      deleted: { $ne: true },
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate rating distribution
    const allReviews = await Review.find({
      roomId: id,
      deleted: { $ne: true },
    }).lean();

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    });

    return {
      room: JSON.parse(JSON.stringify(room)),
      ratingStats: {
        averageRating: room.averageRating || 0,
        totalReviews: room.reviewCount || 0,
        distribution,
      },
      reviews: JSON.parse(JSON.stringify(reviews)),
    };
  } catch (error) {
    console.error('Failed to fetch room with reviews:', error);
    return null;
  }
}

export async function generateMetadata({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const data = await getRoomWithReviews(id);
  return {
    title: data?.room ? `${data.room.name} | StayEasy` : 'Room Not Found',
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const data = await getRoomWithReviews(id);

  if (!data) {
    notFound();
  }

  const { room, ratingStats, reviews } = data;

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

          {/* Location Section */}
          {room.latitude && room.longitude && (
            <div className="mt-8 pb-8 border-b border-primary/10">
              <h3 className="text-xl font-black uppercase tracking-tight">
                Vị trí
              </h3>
              <p className="mt-2 opacity-80">
                {[room.address, room.district, room.city].filter(Boolean).join(', ')}
              </p>
              <div className="mt-4 h-[400px] rounded-xl overflow-hidden">
                <Map
                  lat={room.latitude}
                  lng={room.longitude}
                  zoom={15}
                  address={[room.address, room.district, room.city].filter(Boolean).join(', ')}
                  roomName={room.name}
                  showNearby={true}
                  nearbyTypes={['restaurant', 'atm', 'convenience']}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-xl font-black uppercase tracking-tight">
              Đánh giá
            </h3>

            {/* Rating Summary */}
            <div className="mt-4">
              <RatingSummary
                averageRating={ratingStats.averageRating}
                totalReviews={ratingStats.totalReviews}
                distribution={ratingStats.distribution}
              />
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {reviews.map((review: any) => (
                  <div key={review._id} className="flex flex-col gap-2 p-4 rounded-xl bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <p className="font-bold">
                          {review.userId?.name || 'Người dùng ẩn danh'}
                        </p>
                        <p className="text-sm opacity-60">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="material-symbols-outlined text-highlight fill-current">
                          {review.rating >= 1 ? 'star' : 'star_border'}
                        </span>
                        <span className="material-symbols-outlined text-highlight fill-current">
                          {review.rating >= 2 ? 'star' : 'star_border'}
                        </span>
                        <span className="material-symbols-outlined text-highlight fill-current">
                          {review.rating >= 3 ? 'star' : 'star_border'}
                        </span>
                        <span className="material-symbols-outlined text-highlight fill-current">
                          {review.rating >= 4 ? 'star' : 'star_border'}
                        </span>
                        <span className="material-symbols-outlined text-highlight fill-current">
                          {review.rating >= 5 ? 'star' : 'star_border'}
                        </span>
                      </div>
                    </div>
                    <p className="opacity-80">&quot;{review.comment}&quot;</p>
                    {review.isVerified && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-highlight text-sm">verified</span>
                        <span className="text-xs font-medium text-highlight">Đã xác nhận đã ở</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center opacity-60 p-8">
                Chưa có đánh giá nào cho phòng này.
              </p>
            )}

            {/* Load More Reviews (opens new page with pagination) */}
            {ratingStats.totalReviews > 5 && (
              <div className="mt-6 text-center">
                <a
                  href={`#reviews`}
                  className="inline-flex items-center gap-2 text-highlight hover:underline"
                >
                  <span>Xem tất cả {ratingStats.totalReviews} đánh giá</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            )}
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
