import mongoose, { Document, Schema, Types } from 'mongoose'

export type DebtType = 'lent' | 'borrowed'
export type DebtStatus = 'pending' | 'settled'

export interface IDebt extends Document {
  userId: Types.ObjectId
  person: string
  amount: number
  type: DebtType
  description: string
  date: Date
  dueDate?: Date
  status: DebtStatus
  createdAt: Date
  updatedAt: Date
}

const debtSchema = new Schema<IDebt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  person: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['lent', 'borrowed'], required: true },
  description: { type: String, trim: true, default: '' },
  date: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'settled'], default: 'pending' },
}, { timestamps: true })

debtSchema.index({ userId: 1, status: 1, date: -1 })
export default (mongoose.models.Debt as mongoose.Model<IDebt>) || mongoose.model<IDebt>('Debt', debtSchema)
