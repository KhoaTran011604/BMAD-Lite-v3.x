import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Material from '@/models/Material';
import { requireWriteAccess } from '@/lib/auth-guard';
import { z } from 'zod';

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const UpdateMaterialSchema = z.object({
  name: z.string({ required_error: 'Material name is required' }).trim().min(1, 'Material name cannot be empty'),
  type: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Tools'], {
    errorMap: () => ({ message: 'Material type must be one of: Seeds, Fertilizers, Pesticides, Tools' }),
  }),
  uom: z.string({ required_error: 'Unit of Measurement (UOM) is required' }).trim().min(1, 'UOM cannot be empty'),
  safetyStock: z.number({ required_error: 'Safety Stock is required' }).min(0, 'Safety Stock must be non-negative'),
});

// PUT /api/materials/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const writeAccess = requireWriteAccess(req);
  if ('response' in writeAccess) {
    return writeAccess.response;
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Material ID parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const body = await req.json();

    // Backend validation via Zod
    const validation = UpdateMaterialSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, type, uom, safetyStock } = validation.data;

    // Check if name is already in use by another material
    const nameConflict = await Material.findOne({ name, _id: { $ne: id } });
    if (nameConflict) {
      return NextResponse.json(
        { error: `Material with name "${name}" already exists` },
        { status: 400 }
      );
    }

    // Find and update the material catalog document
    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { name, type, uom, safetyStock },
      { new: true, runValidators: true }
    );

    if (!updatedMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    const response: IApiResponse<typeof updatedMaterial> = {
      data: updatedMaterial,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update material';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
