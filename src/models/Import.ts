import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IImport {
  date: Date;
  supplierName: string;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  batchCode?: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImportDocument extends IImport, Document {}

const ImportSchema = new Schema<IImportDocument>(
  {
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.0001, 'Quantity must be greater than zero'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0.0001, 'Unit price must be greater than zero'],
    },
    batchCode: {
      type: String,
      trim: true,
    },
    expirationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast transaction history queries and lookups
ImportSchema.index({ date: -1 });
ImportSchema.index({ materialId: 1 });

const Import: Model<IImportDocument> =
  mongoose.models.Import || mongoose.model<IImportDocument>('Import', ImportSchema);

export default Import;
