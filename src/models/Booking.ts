import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  originalPrice?: number;
  discountAmount?: number;
  promoCode?: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  checkedInAt?: Date;
  paymentInfo?: {
    description: string;
    qrUrl: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },
    specialRequests: { type: String },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    originalPrice: { type: Number },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'],
      default: 'pending',
    },
    checkedInAt: { type: Date },
    paymentInfo: {
      description: String,
      qrUrl: String,
      accountName: String,
      accountNumber: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

BookingSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string })?.toString();
    if (ret.roomId) ret.roomId = (ret.roomId as { toString(): string }).toString();
    if (ret.userId) ret.userId = (ret.userId as { toString(): string }).toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
