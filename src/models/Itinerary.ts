import mongoose, { Schema, Document } from 'mongoose';

/**
 * Saved AI-generated itinerary document structure
 */
export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  guestName: string;
  stayDuration: number;
  vibe: string;
  location: string;
  // AI-generated content
  intro: string;
  days: Array<{
    day: number;
    theme: string;
    activities: Array<{
      time: string;
      task: string;
      desc: string;
      pro_tip?: string;
    }>;
  }>;
  outro?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  time: { type: String, required: true },
  task: { type: String, required: true },
  desc: { type: String, required: true },
  pro_tip: { type: String },
}, { _id: false });

const DaySchema = new Schema({
  day: { type: Number, required: true },
  theme: { type: String, required: true },
  activities: [ActivitySchema],
}, { _id: false });

const ItinerarySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    guestName: { type: String, required: true },
    stayDuration: { type: Number, required: true },
    vibe: { type: String, required: true },
    location: { type: String, default: 'Đà Lạt' },
    // AI-generated content
    intro: { type: String, required: true },
    days: [DaySchema],
    outro: { type: String },
  },
  { timestamps: true }
);

ItinerarySchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string })?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
