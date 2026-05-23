'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { queryKeys } from '@/lib/utils';

export type MaterialType = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools';
export type TransactionMode = 'import' | 'export';

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

export interface ImportFormValues {
  transactionMode: 'import';
  materialId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  date: string;
  batchCode?: string;
  expirationDate?: string;
}

export interface ExportFormValues {
  transactionMode: 'export';
  materialId: string;
  requesterName: string;
  quantity: number;
  date: string;
  destinationPurpose: string;
}

const parseNumberInput = (value: unknown): number | undefined => {
  if (
    value === '' ||
    value === undefined ||
    value === null ||
    (typeof value === 'number' && Number.isNaN(value))
  ) {
    return undefined;
  }

  return Number(value);
};

const transactionModeSchema = z.enum(['import', 'export']);

const baseTransactionSchema = z.object({
  transactionMode: transactionModeSchema,
  materialId: z
    .string({ required_error: 'Please select a catalog supply item' })
    .min(1, 'Please select a catalog supply item'),
  quantity: z.preprocess(
    parseNumberInput,
    z
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a positive number',
      })
      .positive('Quantity must be greater than zero')
  ),
  date: z
    .string({ required_error: 'Transaction date is required' })
    .min(1, 'Transaction date is required'),
  supplierName: z.string().optional(),
  unitPrice: z.preprocess(
    parseNumberInput,
    z
      .number({
        invalid_type_error: 'Unit Price must be a positive number',
      })
      .positive('Unit Price must be greater than zero')
      .optional()
  ),
  batchCode: z.string().optional(),
  expirationDate: z.string().optional(),
  requesterName: z.string().optional(),
  destinationPurpose: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof baseTransactionSchema>;

const isChemicalMaterial = (material: IMaterial | undefined): boolean =>
  material?.type === 'Pesticides' || material?.type === 'Fertilizers';

export const createTransactionSchema = (getMaterials: () => IMaterial[]) =>
  baseTransactionSchema.superRefine((data, ctx) => {
    const selectedMaterial = getMaterials().find((material: IMaterial) => material._id === data.materialId);

    if (data.transactionMode === 'import') {
      if (!data.supplierName || data.supplierName.trim() === '') {
        ctx.addIssue({
          path: ['supplierName'],
          code: z.ZodIssueCode.custom,
          message: 'Supplier name cannot be empty',
        });
      }

      if (typeof data.unitPrice !== 'number' || Number.isNaN(data.unitPrice)) {
        ctx.addIssue({
          path: ['unitPrice'],
          code: z.ZodIssueCode.custom,
          message: 'Unit Price is required',
        });
      }

      if (isChemicalMaterial(selectedMaterial)) {
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
    }

    if (data.transactionMode === 'export') {
      if (!data.requesterName || data.requesterName.trim() === '') {
        ctx.addIssue({
          path: ['requesterName'],
          code: z.ZodIssueCode.custom,
          message: 'Requester name cannot be empty',
        });
      }

      if (!data.destinationPurpose || data.destinationPurpose.trim() === '') {
        ctx.addIssue({
          path: ['destinationPurpose'],
          code: z.ZodIssueCode.custom,
          message: 'Purpose/Destination is required',
        });
      }

      if (selectedMaterial && data.quantity > selectedMaterial.currentStock) {
        ctx.addIssue({
          path: ['quantity'],
          code: z.ZodIssueCode.custom,
          message: 'Insufficient Stock',
        });
      }
    }
  });

const createDefaultValues = (): TransactionFormValues => ({
  transactionMode: 'import',
  materialId: '',
  supplierName: '',
  quantity: undefined as unknown as number,
  unitPrice: undefined,
  date: new Date().toISOString().split('T')[0],
  batchCode: '',
  expirationDate: '',
  requesterName: '',
  destinationPurpose: '',
});

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
  const materialsRef = useRef<IMaterial[]>([]);

  const { data: materialsData, isLoading: isMaterialsLoading } = useQuery<IApiResponse<IMaterial[]>, Error>({
    queryKey: queryKeys.materials.all,
    queryFn: async (): Promise<IApiResponse<IMaterial[]>> => {
      const response = await fetch('/api/materials');

      if (!response.ok) {
        throw new Error('Failed to load catalog supply list');
      }

      return response.json();
    },
  });

  const materials: IMaterial[] = materialsData?.data ?? [];
  materialsRef.current = materials;

  const transactionSchema = useMemo(
    () => createTransactionSchema(() => materialsRef.current),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: createDefaultValues(),
  });

  const transactionMode = watch('transactionMode');
  const watchedMaterialId = watch('materialId');
  const watchedQuantity = watch('quantity');
  const selectedMaterial = materials.find((material: IMaterial) => material._id === watchedMaterialId);
  const isChemical = transactionMode === 'import' && isChemicalMaterial(selectedMaterial);
  const stockError =
    transactionMode === 'export' &&
    selectedMaterial &&
    typeof watchedQuantity === 'number' &&
    !Number.isNaN(watchedQuantity) &&
    watchedQuantity > selectedMaterial.currentStock
      ? 'Insufficient Stock'
      : undefined;

  const importMutation = useMutation<IApiResponse<unknown>, Error, ImportFormValues>({
    mutationFn: async (newImport) => {
      const response = await fetch('/api/imports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'FarmManager',
        },
        body: JSON.stringify(newImport),
      });

      if (!response.ok) {
        const payload: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to record import delivery');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.imports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      handleClose();
    },
  });

  const exportMutation = useMutation<IApiResponse<unknown>, Error, ExportFormValues>({
    mutationFn: async (newExport) => {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'FarmManager',
        },
        body: JSON.stringify(newExport),
      });

      if (!response.ok) {
        const payload: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to record export transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      handleClose();
    },
  });

  const handleClose = () => {
    reset(createDefaultValues());
    setSearchTerm('');
    setIsDropdownOpen(false);
    importMutation.reset();
    exportMutation.reset();
    onClose();
  };

  const handleModeChange = (mode: TransactionMode) => {
    setValue('transactionMode', mode, { shouldDirty: true, shouldValidate: true });
    setIsDropdownOpen(false);
    setSearchTerm('');
    importMutation.reset();
    exportMutation.reset();
    void trigger();
  };

  const onSubmit = (values: TransactionFormValues) => {
    if (values.transactionMode === 'import') {
      importMutation.mutate({
        transactionMode: 'import',
        materialId: values.materialId,
        supplierName: values.supplierName ?? '',
        quantity: values.quantity,
        unitPrice: values.unitPrice ?? 0,
        date: values.date,
        batchCode: values.batchCode?.trim() ? values.batchCode.trim() : undefined,
        expirationDate: values.expirationDate?.trim() ? values.expirationDate : undefined,
      });

      return;
    }

    exportMutation.mutate({
      transactionMode: 'export',
      materialId: values.materialId,
      requesterName: values.requesterName ?? '',
      quantity: values.quantity,
      date: values.date,
      destinationPurpose: values.destinationPurpose ?? '',
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionMode === 'export') {
      void trigger('quantity');
    }
  }, [transactionMode, watchedMaterialId, watchedQuantity, trigger]);

  const filteredMaterials = materials.filter((material: IMaterial) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMutation = transactionMode === 'import' ? importMutation : exportMutation;
  const apiError = activeMutation.error?.message;
  const isSaving = activeMutation.isPending;
  const submitLabel = transactionMode === 'import' ? 'Record Delivery' : 'Record Export';
  const loadingLabel = transactionMode === 'import' ? 'Recording Delivery...' : 'Recording Export...';
  const drawerTitle = transactionMode === 'import' ? 'Log Supply Transaction' : 'Log Export Transaction';
  const quantityLabel = transactionMode === 'import' ? 'Quantity Imported' : 'Quantity to Export';

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={`drawer-content ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="drawer-header">
          <h2 id="drawer-title">{drawerTitle}</h2>
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
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
            }}
            role="tablist"
            aria-label="Transaction mode"
          >
            <button
              className={transactionMode === 'import' ? 'glass-btn glass-btn-primary' : 'glass-btn'}
              style={{ borderRadius: '9999px', padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}
              type="button"
              role="tab"
              aria-selected={transactionMode === 'import'}
              aria-controls="transaction-form-panel"
              onClick={() => handleModeChange('import')}
            >
              Import
            </button>
            <button
              className={transactionMode === 'export' ? 'glass-btn glass-btn-primary' : 'glass-btn'}
              style={{ borderRadius: '9999px', padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}
              type="button"
              role="tab"
              aria-selected={transactionMode === 'export'}
              aria-controls="transaction-form-panel"
              onClick={() => handleModeChange('export')}
            >
              Export
            </button>
          </div>

          <form
            id="transaction-form-panel"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            {apiError && (
              <div
                style={{
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  backgroundColor: 'var(--danger-glow)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                role="alert"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{apiError}</span>
              </div>
            )}

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
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
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
                        filteredMaterials.map((material: IMaterial) => {
                          const isSelected = material._id === watchedMaterialId;

                          return (
                            <div
                              key={material._id}
                              onClick={() => {
                                setValue('materialId', material._id, { shouldDirty: true, shouldValidate: true });
                                setIsDropdownOpen(false);
                              }}
                              className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span>{material.name}</span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                {material.type} ({material.uom})
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.materialId && (
                <span className="form-field-error" role="alert">
                  {errors.materialId.message}
                </span>
              )}
            </div>

            {transactionMode === 'import' ? (
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
                  <span className="form-field-error" role="alert">
                    {errors.supplierName.message}
                  </span>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="requester-input">
                  Requester Name <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  id="requester-input"
                  placeholder="e.g. Field A Team"
                  className={`glass-input ${errors.requesterName ? 'error' : ''}`}
                  {...register('requesterName')}
                />
                {errors.requesterName && (
                  <span className="form-field-error" role="alert">
                    {errors.requesterName.message}
                  </span>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity-input">
                  {quantityLabel} <span className="required-indicator">*</span>
                  {selectedMaterial && (
                    <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '0.25rem' }}>
                      ({selectedMaterial.uom})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="any"
                  id="quantity-input"
                  placeholder="0.00"
                  className={`glass-input ${errors.quantity || stockError ? 'error' : ''}`}
                  {...register('quantity', { valueAsNumber: true })}
                />
                {transactionMode === 'export' && selectedMaterial && (
                  <span
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: '0.8rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    Available stock: {selectedMaterial.currentStock} {selectedMaterial.uom}
                  </span>
                )}
                {(errors.quantity || stockError) && (
                  <span className="form-field-error" role="alert">
                    {errors.quantity?.message || stockError}
                  </span>
                )}
              </div>

              {transactionMode === 'import' ? (
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
                    {...register('unitPrice', { valueAsNumber: true })}
                  />
                  {errors.unitPrice && (
                    <span className="form-field-error" role="alert">
                      {errors.unitPrice.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="purpose-input">
                    Purpose / Destination <span className="required-indicator">*</span>
                  </label>
                  <input
                    type="text"
                    id="purpose-input"
                    placeholder="e.g. Field A"
                    className={`glass-input ${errors.destinationPurpose ? 'error' : ''}`}
                    {...register('destinationPurpose')}
                  />
                  {errors.destinationPurpose && (
                    <span className="form-field-error" role="alert">
                      {errors.destinationPurpose.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date-input">
                Transaction Date <span className="required-indicator">*</span>
              </label>
              <input
                type="date"
                id="date-input"
                className={`glass-input ${errors.date ? 'error' : ''}`}
                {...register('date')}
              />
              {errors.date && (
                <span className="form-field-error" role="alert">
                  {errors.date.message}
                </span>
              )}
            </div>

            {transactionMode === 'import' && (
              <div
                style={{
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: isChemical
                    ? '1px dashed rgba(245, 158, 11, 0.2)'
                    : '1px dashed rgba(255,255,255,0.05)',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {isChemical && (
                  <div
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.03)',
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.8rem',
                      color: '#fde68a',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>
                      <strong>Chemical Supply Detected:</strong> Expiration schedules and batch tracking codes are required for safety compliance.
                    </span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="batchCode-input">
                      Batch Code
                      {isChemical ? (
                        <span className="required-indicator">
                          *
                          <span className="chemical-indicator">(Chemical Required)</span>
                        </span>
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
                      <span className="form-field-error" role="alert">
                        {errors.batchCode.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="expirationDate-input">
                      Expiration Date
                      {isChemical ? (
                        <span className="required-indicator">
                          *
                          <span className="chemical-indicator">(Chemical Required)</span>
                        </span>
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
                      <span className="form-field-error" role="alert">
                        {errors.expirationDate.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                disabled={isSaving || Boolean(stockError)}
                id="submit-transaction-btn"
                aria-busy={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="spinner" />
                    <span>{loadingLabel}</span>
                  </>
                ) : (
                  <span>{submitLabel}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
