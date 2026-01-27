import mongoose, { Document, Schema } from "mongoose";
import { nanoid } from "nanoid";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IContact extends Document {
  contactId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read";
  createdBy?: mongoose.Types.ObjectId; // optional if you want to track admin/user
}

const ContactSchema = new Schema<IContact>(
  {
    contactId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Generate unique contactId if new
ContactSchema.pre("validate", async function (next) {
  if (this.isNew && !this.contactId) {
    this.contactId = `CNT-${nanoid(8).toUpperCase()}`;
  }
  next();
});

ContactSchema.plugin(mongoosePaginate);

const Contact = mongoose.model<IContact, mongoose.PaginateModel<IContact>>(
  "Contact",
  ContactSchema
);

export default Contact;
