import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Material from '@/models/Material';
import Import from '@/models/Import';
import Export from '@/models/Export';
import { buildDashboardSummary } from '@/lib/utils';
import { z } from 'zod';

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const CreateMaterialSchema = z.object({
  name: z.string({ required_error: 'Material name is required' }).trim().min(1, 'Material name cannot be empty'),
  type: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Tools'], {
    errorMap: () => ({ message: 'Material type must be one of: Seeds, Fertilizers, Pesticides, Tools' }),
  }),
  uom: z.string({ required_error: 'Unit of Measurement (UOM) is required' }).trim().min(1, 'UOM cannot be empty'),
  safetyStock: z.number({ required_error: 'Safety Stock is required' }).min(0, 'Safety Stock must be non-negative'),
});

// GET /api/materials
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const view = req.nextUrl.searchParams.get('view');

    if (view === 'dashboard') {
      const [materials, imports, exports] = await Promise.all([
        Material.find({}).sort({ name: 1 }),
        Import.find({}).sort({ date: -1 }),
        Export.find({}).sort({ date: -1 }),
      ]);

      const dashboardSummary = buildDashboardSummary(materials, imports, exports);
      const response: IApiResponse<typeof dashboardSummary> = {
        data: dashboardSummary,
      };

      return NextResponse.json(response);
    }

    // Query all materials, sorted alphabetically by name
    const materials = await Material.find({}).sort({ name: 1 });

    const response: IApiResponse<typeof materials> = {
      data: materials,
      meta: {
        page: 1,
        limit: materials.length,
        total: materials.length,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch materials';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST /api/materials
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
    const validation = CreateMaterialSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, type, uom, safetyStock } = validation.data;

    // Check unique name to give a friendly error
    const existing = await Material.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: `Material with name "${name}" already exists` },
        { status: 400 }
      );
    }

    const newMaterial = await Material.create({
      name,
      type,
      uom,
      safetyStock,
      currentStock: 0, // default 0 on creation
    });

    const response: IApiResponse<typeof newMaterial> = {
      data: newMaterial,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create material';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
