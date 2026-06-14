import mongoose, {
  Mongoose,
  Schema,
  type Document,
  type ObjectId,
} from "mongoose";

type projectStatus = "down" | "starting" | "running" | "stopping";
export interface IProject extends Document {
  title: string;
  slug: string;
  language: string;
  assetsUrl: string | null;
  userId: ObjectId | string;
  status: projectStatus;

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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    status: {
      type: String,
      default: "down",
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
