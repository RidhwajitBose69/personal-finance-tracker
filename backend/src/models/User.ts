import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  currentBankBalance: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  currentBankBalance: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true })

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema)
