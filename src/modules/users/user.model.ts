import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "employee" | "employer";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isAccountActivated: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["employee", "employer"],
      required: true,
    },
    isAccountActivated: {
      type: Boolean,
      default: false,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: /^\+?[1-9]\d{1,14}$/, // E.164
    },
  },
  {
    timestamps: true,
  },
);

// Unique indexes (ensure at startup with mongoose.set('strictQuery',true))
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Hash on create or password change
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
