import mongoose, { Schema, Document, Model } from 'mongoose';

export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';

export interface IMaterial {
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaterialDocument extends IMaterial, Document {}

const MaterialSchema = new Schema<IMaterialDocument>(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Material type is required'],
      enum: {
        values: ['Seeds', 'Fertilizers', 'Pesticides', 'Tools'],
        message: '{VALUE} is not a valid material type',
      },
    },
    uom: {
      type: String,
      required: [true, 'Unit of Measurement (UOM) is required'],
      trim: true,
    },
    safetyStock: {
      type: Number,
      required: [true, 'Safety Stock threshold is required'],
      min: [0, 'Safety Stock must be a positive number'],
      default: 0,
    },
    currentStock: {
      type: Number,
      required: [true, 'Current Stock is required'],
      min: [0, 'Current Stock cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
MaterialSchema.index({ type: 1 });

const Material: Model<IMaterialDocument> =
  mongoose.models.Material || mongoose.model<IMaterialDocument>('Material', MaterialSchema);

export default Material;
