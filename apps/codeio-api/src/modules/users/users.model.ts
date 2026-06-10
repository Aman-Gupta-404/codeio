import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;

  firstName: string;
  lastName: string;
  imageUrl: string | null;

  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: String,
    lastName: String,
    imageUrl: String,

    lastLoginAt: Date,

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const User = mongoose.model<IUser>("User", UserSchema);
