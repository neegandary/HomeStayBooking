export interface Room {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  capacity: number;
  amenities: string[];
  available: boolean;
}

export interface RoomFilter {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}