import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Import from '@/models/Import';
import Material from '@/models/Material';
import { z } from 'zod';

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const CreateImportSchema = z.object({
  date: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date({
      required_error: 'Transaction date is required',
      invalid_type_error: 'Invalid transaction date format',
    })
  ),
  supplierName: z.string({ required_error: 'Supplier name is required' }).trim().min(1, 'Supplier name cannot be empty'),
  materialId: z.string({ required_error: 'Material ID is required' }).refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Material ID format',
  }),
  quantity: z.number({ required_error: 'Quantity is required' }).gt(0, 'Quantity must be greater than zero'),
  unitPrice: z.number({ required_error: 'Unit price is required' }).gt(0, 'Unit price must be greater than zero'),
  batchCode: z.string().trim().optional(),
  expirationDate: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? undefined : typeof val === 'string' ? new Date(val) : val),
    z.date().optional()
  ),
});

// GET /api/imports
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch imports, sorted by date descending, and populate the referenced material details
    const imports = await Import.find({})
      .populate({
        path: 'materialId',
        model: Material,
      })
      .sort({ date: -1 });

    const response: IApiResponse<typeof imports> = {
      data: imports,
      meta: {
        page: 1,
        limit: imports.length,
        total: imports.length,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch import transactions';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST /api/imports
export async function POST(req: NextRequest) {
  try {
    // Simulated header check for role-based authorization (Farm Manager privileges)
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'Manager' && userRole !== 'FarmManager') {
      return NextResponse.json(
        { error: 'Unauthorized: Farm Manager privileges required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    // Backend validation via Zod
    const validation = CreateImportSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { date, supplierName, materialId, quantity, unitPrice, batchCode, expirationDate } = validation.data;

    // Check if the referenced material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return NextResponse.json(
        { error: `Material with ID "${materialId}" does not exist` },
        { status: 400 }
      );
    }

    // Atomic/transactional operation: Create import log and increment material currentStock
    const newImport = await Import.create({
      date,
      supplierName,
      materialId: new mongoose.Types.ObjectId(materialId),
      quantity,
      unitPrice,
      batchCode,
      expirationDate,
    });

    // Atomically increment currentStock in materials collection
    await Material.findByIdAndUpdate(materialId, {
      $inc: { currentStock: quantity },
    });

    // Populate material details to return a complete, informative response
    const populatedImport = await newImport.populate({
      path: 'materialId',
      model: Material,
    });

    const response: IApiResponse<typeof populatedImport> = {
      data: populatedImport,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to log import transaction';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
