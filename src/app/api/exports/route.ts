import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';

import dbConnect from '@/lib/dbConnect';
import { requireWriteAccess } from '@/lib/auth-guard';
import Export, { IExportDocument } from '@/models/Export';
import Material from '@/models/Material';

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const createExportSchema = z.object({
  date: z.preprocess(
    (value) => (typeof value === 'string' ? new Date(value) : value),
    z.date({
      required_error: 'Transaction date is required',
      invalid_type_error: 'Invalid transaction date format',
    })
  ),
  requesterName: z.string({ required_error: 'Requester name is required' }).trim().min(1, 'Requester name cannot be empty'),
  materialId: z.string({ required_error: 'Material ID is required' }).refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid Material ID format',
  }),
  quantity: z.number({ required_error: 'Quantity is required' }).gt(0, 'Quantity must be greater than zero'),
  destinationPurpose: z
    .string({ required_error: 'Destination purpose is required' })
    .trim()
    .min(1, 'Destination purpose cannot be empty'),
});

const isTransactionUnsupportedError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('Transaction numbers are only allowed on a replica set member or mongos');
};

const createExportRecord = async (
  date: Date,
  requesterName: string,
  materialObjectId: mongoose.Types.ObjectId,
  quantity: number,
  destinationPurpose: string
): Promise<IExportDocument> =>
  Export.create({
    date,
    requesterName,
    materialId: materialObjectId,
    quantity,
    destinationPurpose,
  });

const populateExportRecord = async (exportDocument: IExportDocument) =>
  exportDocument.populate({
    path: 'materialId',
    model: Material,
  });

const createExportWithTransaction = async (
  date: Date,
  requesterName: string,
  materialId: string,
  materialObjectId: mongoose.Types.ObjectId,
  quantity: number,
  destinationPurpose: string
): Promise<IExportDocument> => {
  const session = await mongoose.startSession();
  let createdExport: IExportDocument | null = null;

  try {
    await session.withTransaction(async () => {
      const updatedMaterial = await Material.findOneAndUpdate(
        {
          _id: materialObjectId,
          currentStock: { $gte: quantity },
        },
        {
          $inc: { currentStock: -quantity },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedMaterial) {
        const materialExists = await Material.exists({ _id: materialObjectId }).session(session);
        if (!materialExists) {
          throw new Error(`Material with ID "${materialId}" does not exist`);
        }

        throw new Error('Insufficient stock available');
      }

      const [newExport] = await Export.create(
        [
          {
            date,
            requesterName,
            materialId: materialObjectId,
            quantity,
            destinationPurpose,
          },
        ],
        { session }
      );

      createdExport = newExport;
    });
  } finally {
    await session.endSession();
  }

  if (!createdExport) {
    throw new Error('Failed to log export transaction');
  }

  return createdExport;
};

const createExportWithoutTransaction = async (
  date: Date,
  requesterName: string,
  materialId: string,
  materialObjectId: mongoose.Types.ObjectId,
  quantity: number,
  destinationPurpose: string
): Promise<IExportDocument> => {
  const updatedMaterial = await Material.findOneAndUpdate(
    {
      _id: materialObjectId,
      currentStock: { $gte: quantity },
    },
    {
      $inc: { currentStock: -quantity },
    },
    {
      new: true,
    }
  );

  if (!updatedMaterial) {
    const materialExists = await Material.exists({ _id: materialObjectId });
    if (!materialExists) {
      throw new Error(`Material with ID "${materialId}" does not exist`);
    }

    throw new Error('Insufficient stock available');
  }

  try {
    return await createExportRecord(date, requesterName, materialObjectId, quantity, destinationPurpose);
  } catch (error: unknown) {
    await Material.findByIdAndUpdate(materialObjectId, {
      $inc: { currentStock: quantity },
    });

    throw error;
  }
};

export async function GET() {
  try {
    await dbConnect();

    const exports = await Export.find({})
      .populate({
        path: 'materialId',
        model: Material,
      })
      .sort({ date: -1 });

    const response: IApiResponse<typeof exports> = {
      data: exports,
      meta: {
        page: 1,
        limit: exports.length,
        total: exports.length,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch export transactions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const writeAccess = requireWriteAccess(req);
  if ('response' in writeAccess) {
    return writeAccess.response;
  }

  try {
    await dbConnect();

    const body: unknown = await req.json();
    const validation = createExportSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors.map((entry) => entry.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { date, requesterName, materialId, quantity, destinationPurpose } = validation.data;
    const materialObjectId = new mongoose.Types.ObjectId(materialId);
    let createdExport: IExportDocument;

    try {
      createdExport = await createExportWithTransaction(
        date,
        requesterName,
        materialId,
        materialObjectId,
        quantity,
        destinationPurpose
      );
    } catch (error: unknown) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }

      createdExport = await createExportWithoutTransaction(
        date,
        requesterName,
        materialId,
        materialObjectId,
        quantity,
        destinationPurpose
      );
    }

    const populatedExport = await populateExportRecord(createdExport);

    const response: IApiResponse<typeof populatedExport> = {
      data: populatedExport,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to log export transaction';
    const status = message === 'Insufficient stock available' || message.includes('does not exist') ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
