# Data Models

## Material
**Purpose:** Represents a registered inventory item (seeds, fertilizer, tool, etc.) that can be receipted or disbursed.

**Key Attributes:**
- `id`: string (PK, MongoDB ObjectId)
- `name`: string - The unique name of the material (e.g., "Urea Fertilizer")
- `type`: string (Seeds | Fertilizers | Pesticides | Tools) - The category of agricultural supply
- `uom`: string - Unit of Measurement (e.g., "kg", "liters", "units")
- `safetyStock`: number - The threshold below which a low-stock alert is generated
- `currentStock`: number - The computed physical stock currently on hand (default 0)
- `createdAt`: Date (timestamp)
- `updatedAt`: Date (timestamp)

**Relationships:**
- Has many `Import` transaction logs
- Has many `Export` transaction logs

## Import
**Purpose:** Logs incoming materials received from suppliers to update inventory balances.

**Key Attributes:**
- `id`: string (PK, MongoDB ObjectId)
- `date`: Date - The date of the shipment receipt
- `supplierName`: string - The name of the supplying vendor
- `materialId`: string (FK -> Material) - The reference to the catalog material
- `quantity`: number - Quantity imported (must be > 0)
- `unitPrice`: number - Price per unit (must be > 0)
- `batchCode`: string (optional/recommended) - Batch identifier for safety monitoring
- `expirationDate`: Date (optional/recommended) - Batch shelf-life expiration date (recommended for chemical/seed types)
- `createdAt`: Date (timestamp)
- `updatedAt`: Date (timestamp)

**Relationships:**
- Belongs to a `Material` catalog entry

## Export
**Purpose:** Logs outgoing materials disbursed to field operators or destinations.

**Key Attributes:**
- `id`: string (PK, MongoDB ObjectId)
- `date`: Date - The date of disbursement
- `requesterName`: string - The farm operator receiving the item
- `materialId`: string (FK -> Material) - The reference to the catalog material
- `quantity`: number - Quantity disbursed (must be > 0)
- `destinationPurpose`: string - Destination/Purpose tag (e.g. "Field A", "Tool Repair")
- `createdAt`: Date (timestamp)
- `updatedAt`: Date (timestamp)

**Relationships:**
- Belongs to a `Material` catalog entry

## TypeScript Interfaces

```typescript
export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';

export interface IMaterial {
  id: string;
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImport {
  id: string;
  date: Date;
  supplierName: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  batchCode?: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExport {
  id: string;
  date: Date;
  requesterName: string;
  materialId: string;
  quantity: number;
  destinationPurpose: string;
  createdAt: Date;
  updatedAt: Date;
}
```
