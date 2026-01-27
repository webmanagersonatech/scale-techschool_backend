import mongoose, { Schema, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";

export interface IWillingJoiner extends Document {
  joinerId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  source?: string;
  status: "New" | "Contacted" | "Interested" | "Joined" | "Dropped";
  createdAt?: Date;
  updatedAt?: Date;
}

const WillingJoinerSchema = new Schema<IWillingJoiner>(
  {
    joinerId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      default: "Website",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Joined", "Dropped"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔹 Auto-generate joinerId
 * Format: JOIN-XXXXXX
 */
WillingJoinerSchema.pre<IWillingJoiner>("save", function (next) {
  if (!this.joinerId) {
    this.joinerId = `JOIN-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;
  }
  next();
});

WillingJoinerSchema.plugin(mongoosePaginate);

export interface IWillingJoinerModel
  extends mongoose.PaginateModel<IWillingJoiner> {}

const WillingJoiner = mongoose.model<IWillingJoiner, IWillingJoinerModel>(
  "WillingJoiner",
  WillingJoinerSchema
);

export default WillingJoiner;
