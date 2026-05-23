'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryKeys } from '@/lib/utils';

// Standard TypeScript definitions conforming to docs/architecture/data-models.md
export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';

export interface IMaterial {
  _id: string;
  name: string;
  type: MaterialType;
  uom: string;
  safetyStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Zod validation base schema for recording an import transaction
const ImportBaseSchema = z.object({
  materialId: z.string({ required_error: 'Please select a catalog supply item' }).min(1, 'Please select a catalog supply item'),
  supplierName: z.string({ required_error: 'Supplier name is required' }).trim().min(1, 'Supplier name cannot be empty'),
  quantity: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a positive number' })
      .positive('Quantity must be greater than zero')
  ),
  unitPrice: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Unit Price is required', invalid_type_error: 'Unit Price must be a positive number' })
      .positive('Unit Price must be greater than zero')
  ),
  date: z.string({ required_error: 'Transaction date is required' }).min(1, 'Transaction date is required'),
  batchCode: z.string().optional(),
  expirationDate: z.string().optional(),
});

type ImportFormValues = z.infer<typeof ImportBaseSchema>;

interface QuickActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionDrawer({ isOpen, onClose }: QuickActionDrawerProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // TanStack Query to fetch active catalog items
  const { data: materialsData, isLoading: isMaterialsLoading } = useQuery<IApiResponse<IMaterial[]>, Error>({
    queryKey: queryKeys.materials.all,
    queryFn: async (): Promise<IApiResponse<IMaterial[]>> => {
      const res = await fetch('/api/materials');
      if (!res.ok) {
        throw new Error('Failed to load catalog supply list');
      }
      return res.json();
    },
  });

  const materials = materialsData?.data || [];

  // Dynamic Zod Validation Schema Refinement (Rule 3: Dual-Layer Data Validation)
  // Evaluates selected material category: chemical types (Pesticides/Fertilizers) strictly enforce Batch Code and Expiration Date
  const dynamicSchema = ImportBaseSchema.superRefine((data, ctx) => {
    const selected = materials.find((m) => m._id === data.materialId);
    const isChemical = selected && (selected.type === 'Pesticides' || selected.type === 'Fertilizers');

    if (isChemical) {
      if (!data.batchCode || data.batchCode.trim() === '') {
        ctx.addIssue({
          path: ['batchCode'],
          code: z.ZodIssueCode.custom,
          message: 'Batch code is required for chemical supply items',
        });
      }
      if (!data.expirationDate || data.expirationDate.trim() === '') {
        ctx.addIssue({
          path: ['expirationDate'],
          code: z.ZodIssueCode.custom,
          message: 'Expiration date is required for chemical supply items',
        });
      }
    }
  });

  // React Hook Form Configuration
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      materialId: '',
      supplierName: '',
      quantity: '' as unknown as number,
      unitPrice: '' as unknown as number,
      date: new Date().toISOString().split('T')[0],
      batchCode: '',
      expirationDate: '',
    },
  });

  // Watch fields for dynamic form rendering state
  const watchedMaterialId = watch('materialId');
  const selectedMaterial = materials.find((m) => m._id === watchedMaterialId);
  const isChemical = selectedMaterial && (selectedMaterial.type === 'Pesticides' || selectedMaterial.type === 'Fertilizers');

  // TanStack Query Mutation for recording a delivery (Rule 6: Pure decoupled side effects)
  const importMutation = useMutation<IApiResponse<unknown>, Error, ImportFormValues>({
    mutationFn: async (newImport) => {
      const res = await fetch('/api/imports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'FarmManager', // Simulated admin authentication header credentials
        },
        body: JSON.stringify(newImport),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record import delivery');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to trigger real-time stock and feed updates
      queryClient.invalidateQueries({ queryKey: queryKeys.imports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      handleClose();
    },
  });

  const onSubmit = (values: ImportFormValues) => {
    importMutation.mutate(values);
  };

  const handleClose = () => {
    reset({
      materialId: '',
      supplierName: '',
      quantity: '' as unknown as number,
      unitPrice: '' as unknown as number,
      date: new Date().toISOString().split('T')[0],
      batchCode: '',
      expirationDate: '',
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
    importMutation.reset();
    onClose();
  };

  // Keyboard navigation Escape listener (Accessibility Mandate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside custom select selector to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set focus on dropdown trigger when open (Accessibility Focus Trap helper)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const apiError = importMutation.error?.message;
  const isSaving = importMutation.isPending;

  return (
    <>
      {/* Dimmed Blurred Overlay */}
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={handleClose} 
        aria-hidden="true"
      />

      {/* Slide-in Content Panel */}
      <div 
        className={`drawer-content ${isOpen ? 'open' : ''}`}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="drawer-header">
          <h2 id="drawer-title">Log Supply Transaction</h2>
          <button 
            className="drawer-close-btn" 
            onClick={handleClose}
            aria-label="Close drawer panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Tabs for Future proofing */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <button 
              className="glass-btn glass-btn-primary" 
              style={{ borderRadius: '9999px', padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}
              type="button"
            >
              🌱 Import Supplies
            </button>
            <button 
              className="glass-btn" 
              style={{ borderRadius: '9999px', padding: '0.4rem 1.25rem', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }}
              type="button"
              disabled
              title="Disbursements Export UI coming in Epic 3"
            >
              🚜 Export (Soon)
            </button>
          </div>

          {/* Form Boundary */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {apiError && (
              <div style={{ 
                color: 'var(--danger)', 
                fontSize: '0.85rem', 
                marginBottom: '1.5rem', 
                backgroundColor: 'var(--danger-glow)', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Form Group: Material Dropdown Selector */}
            <div className="form-group">
              <label id="material-select-label">
                Supply Material Item <span className="required-indicator">*</span>
              </label>
              <div className="searchable-select-container">
                <button
                  type="button"
                  ref={triggerRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`glass-input searchable-select-trigger ${errors.materialId ? 'error' : ''}`}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-labelledby="material-select-label"
                  id="material-select-trigger-btn"
                >
                  <span style={{ color: selectedMaterial ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                    {selectedMaterial ? selectedMaterial.name : 'Select catalog supply item...'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="searchable-select-dropdown" ref={dropdownRef} role="listbox">
                    <div className="searchable-select-search-container">
                      <input
                        type="text"
                        placeholder="Type to filter supplies..."
                        className="glass-input"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Filter supply items"
                        autoFocus
                      />
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {isMaterialsLoading ? (
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                          Loading items...
                        </div>
                      ) : filteredMaterials.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                          No materials found
                        </div>
                      ) : (
                        filteredMaterials.map((material) => {
                          const isSelected = material._id === watchedMaterialId;
                          return (
                            <div
                              key={material._id}
                              onClick={() => {
                                setValue('materialId', material._id, { shouldValidate: true });
                                setIsDropdownOpen(false);
                              }}
                              className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span>{material.name}</span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{material.type} ({material.uom})</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.materialId && (
                <span className="form-field-error" role="alert">{errors.materialId.message}</span>
              )}
            </div>

            {/* Form Group: Supplier Name */}
            <div className="form-group">
              <label htmlFor="supplier-input">
                Supplier Vendor Name <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                id="supplier-input"
                placeholder="e.g. Earth Supply Co."
                className={`glass-input ${errors.supplierName ? 'error' : ''}`}
                {...register('supplierName')}
              />
              {errors.supplierName && (
                <span className="form-field-error" role="alert">{errors.supplierName.message}</span>
              )}
            </div>

            {/* Form Row: Quantity and Unit Price */}
            <div className="form-row">
              {/* Quantity Field */}
              <div className="form-group">
                <label htmlFor="quantity-input">
                  Quantity Imported <span className="required-indicator">*</span>
                  {selectedMaterial && (
                    <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '0.25rem' }}>
                      ({selectedMaterial.uom})
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    id="quantity-input"
                    placeholder="0.00"
                    className={`glass-input ${errors.quantity ? 'error' : ''}`}
                    {...register('quantity')}
                  />
                </div>
                {errors.quantity && (
                  <span className="form-field-error" role="alert">{errors.quantity.message}</span>
                )}
              </div>

              {/* Unit Price Field */}
              <div className="form-group">
                <label htmlFor="unitPrice-input">
                  Unit Price ($) <span className="required-indicator">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  id="unitPrice-input"
                  placeholder="0.00"
                  className={`glass-input ${errors.unitPrice ? 'error' : ''}`}
                  {...register('unitPrice')}
                />
                {errors.unitPrice && (
                  <span className="form-field-error" role="alert">{errors.unitPrice.message}</span>
                )}
              </div>
            </div>

            {/* Form Group: Transaction Date */}
            <div className="form-group">
              <label htmlFor="date-input">
                Receipt Transaction Date <span className="required-indicator">*</span>
              </label>
              <input
                type="date"
                id="date-input"
                className={`glass-input ${errors.date ? 'error' : ''}`}
                {...register('date')}
              />
              {errors.date && (
                <span className="form-field-error" role="alert">{errors.date.message}</span>
              )}
            </div>

            {/* Conditional Fields: Expiration & Batch Code for Pesticides/Fertilizers */}
            <div style={{ 
              marginTop: '0.5rem', 
              paddingTop: '1rem', 
              borderTop: isChemical ? '1px dashed rgba(245, 158, 11, 0.2)' : '1px dashed rgba(255,255,255,0.05)',
              transition: 'var(--transition-smooth)'
            }}>
              {isChemical && (
                <div style={{ 
                  backgroundColor: 'rgba(245, 158, 11, 0.03)', 
                  border: '1px solid rgba(245, 158, 11, 0.1)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem', 
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#fde68a',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>
                    <strong>Chemical Supply Detected:</strong> Expiration schedules and Batch monitoring tracking codes are required for safety compliance regulation.
                  </span>
                </div>
              )}

              <div className="form-row">
                {/* Batch Code */}
                <div className="form-group">
                  <label htmlFor="batchCode-input">
                    Batch Code 
                    {isChemical ? (
                      <span className="required-indicator">*<span className="chemical-indicator">(Chemical Required)</span></span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', opacity: 0.5 }}>(Optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="batchCode-input"
                    placeholder="e.g. BATCH-A01"
                    className={`glass-input ${errors.batchCode ? 'error' : ''}`}
                    {...register('batchCode')}
                  />
                  {errors.batchCode && (
                    <span className="form-field-error" role="alert">{errors.batchCode.message}</span>
                  )}
                </div>

                {/* Expiration Date */}
                <div className="form-group">
                  <label htmlFor="expirationDate-input">
                    Expiration Date 
                    {isChemical ? (
                      <span className="required-indicator">*<span className="chemical-indicator">(Chemical Required)</span></span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', opacity: 0.5 }}>(Optional)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    id="expirationDate-input"
                    className={`glass-input ${errors.expirationDate ? 'error' : ''}`}
                    {...register('expirationDate')}
                  />
                  {errors.expirationDate && (
                    <span className="form-field-error" role="alert">{errors.expirationDate.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleClose}
                className="glass-btn"
                style={{ flex: 1 }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-btn glass-btn-primary"
                style={{ flex: 2 }}
                disabled={isSaving}
                id="submit-transaction-btn"
              >
                {isSaving ? (
                  <>
                    <div className="spinner" />
                    <span>Recording Delivery...</span>
                  </>
                ) : (
                  <span>Record Delivery</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
