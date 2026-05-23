import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExport {
  date: Date;
  requesterName: string;
  materialId: mongoose.Types.ObjectId;
  quantity: number;
  destinationPurpose: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExportDocument extends IExport, Document {}

const ExportSchema = new Schema<IExportDocument>(
  {
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
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
    destinationPurpose: {
      type: String,
      required: [true, 'Destination or purpose is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ExportSchema.index({ date: -1 });
ExportSchema.index({ materialId: 1 });

const Export: Model<IExportDocument> =
  mongoose.models.Export || mongoose.model<IExportDocument>('Export', ExportSchema);

export default Export;
