import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  capacity: number;
  amenities: string[];
  available: boolean;
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
