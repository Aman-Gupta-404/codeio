import mongoose from "mongoose";

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }

  return new mongoose.Types.ObjectId(id);
}
