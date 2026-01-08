import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types/auth';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String }, // Optional for OAuth
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Transform _id to id when converting to JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string })?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
