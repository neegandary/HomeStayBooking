import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  capacity: number;
  amenities: string[];
  available: boolean;
  averageRating: number;
  reviewCount: number;
  deleted: boolean;
  // Location fields
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    capacity: { type: Number, required: true },
    amenities: [{ type: String }],
    available: { type: Boolean, default: true },
    // Review aggregation fields - updated in real-time when reviews change
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    // Soft delete for moderation
    deleted: { type: Boolean, default: false, index: true },
    // Location fields for map display
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { timestamps: true }
);

RoomSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string })?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
