import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'Manager' | 'FarmManager' | 'Worker';

export interface IUser {
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      trim: true,
    },
    salt: {
      type: String,
      required: [true, 'Password salt is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['Manager', 'FarmManager', 'Worker'],
        message: '{VALUE} is not a valid user role',
      },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
