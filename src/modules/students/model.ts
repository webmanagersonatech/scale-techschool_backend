import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ISubjectWiseScore {
  subjectName: string;
  score: number;
}

export interface IStudent extends Document {
  studentScaleId: string;
  name: string;
  phone: string;
  email: string;
  studentFeedback?: string;
  trainerFeedback?: string;
  subjectWiseScores: ISubjectWiseScore[];
  events: string;
  date: Date;
  overallScore: number;
  overallAttendance: number;
  
  // QR Code fields
  qrCode?: string;
  qrToken?: string;
  qrGeneratedAt?: Date;
  qrRegeneratedCount?: number;
}

const SubjectWiseScoreSchema = new Schema<ISubjectWiseScore>(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    studentScaleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    studentFeedback: {
      type: String,
      default: "",
    },
    trainerFeedback: {
      type: String,
      default: "",
    },
    subjectWiseScores: {
      type: [SubjectWiseScoreSchema],
      default: [],
    },
    events: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    overallAttendance: {
      type: Number,
      default: 0,
    },
    
    // QR Code fields
    qrCode: {
      type: String,
      default: null,
    },
    qrToken: {
      type: String,
      default: null,
    },
    qrGeneratedAt: {
      type: Date,
      default: null,
    },
    qrRegeneratedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster QR queries
StudentSchema.index({ qrToken: 1 }, { sparse: true });
StudentSchema.index({ qrGeneratedAt: -1 });

StudentSchema.plugin(mongoosePaginate);

const Student = mongoose.model<
  IStudent,
  mongoose.PaginateModel<IStudent>
>("Student", StudentSchema);

export default Student;