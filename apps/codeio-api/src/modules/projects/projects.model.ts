import mongoose, { Schema, type Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  slug: string;
  language: string;
  assetsUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    assetsUrl: String,

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

ProjectSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
