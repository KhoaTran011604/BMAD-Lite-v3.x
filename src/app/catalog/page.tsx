'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';

import { useMaterialsQuery } from '@/hooks/use-materials-queries';
import {
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
} from '@/hooks/use-materials-mutations';
import type { IMaterial } from '@/hooks/use-materials-queries';

import { GenericTable } from '@/components/GenericTable';
import { GenericForm } from '@/components/GenericForm';
import { FormFieldItem } from '@/components/FormFieldItem';

const MaterialFormSchema = z.object({
  name: z
    .string({ required_error: 'Material name is required' })
    .trim()
    .min(1, 'Material name cannot be empty'),
  type: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Tools'], {
    errorMap: () => ({
      message: 'Material type must be one of: Seeds, Fertilizers, Pesticides, Tools',
    }),
  }),
  uom: z
    .string({ required_error: 'Unit of Measurement (UOM) is required' })
    .trim()
    .min(1, 'UOM cannot be empty'),
  safetyStock: z
    .number({
      required_error: 'Safety Stock is required',
      invalid_type_error: 'Safety Stock must be a number',
    })
    .min(0, 'Safety Stock must be non-negative'),
});

type MaterialFormValues = z.infer<typeof MaterialFormSchema>;

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<IMaterial | null>(null);

  // TanStack React Query GET Catalog
  const { data, isLoading, error, refetch } = useMaterialsQuery();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    createMutation.reset();
    updateMutation.reset();
  };

  // Mutations
  const createMutation = useCreateMaterialMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateMutation = useUpdateMaterialMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  // Modal Handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: IMaterial) => {
    setIsEditMode(true);
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  // Keyboard navigation for accessible modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const onSubmit = (values: MaterialFormValues) => {
    if (isEditMode && editingMaterial) {
      updateMutation.mutate({ id: editingMaterial._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const materials: IMaterial[] = data?.data || [];

  // Client-side dynamic filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || material.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, selectedType]);

  const categories = [
    { label: 'All Supplies', value: 'All', emoji: '📦' },
    { label: 'Seeds', value: 'Seeds', emoji: '🌱' },
    { label: 'Fertilizers', value: 'Fertilizers', emoji: '🧪' },
    { label: 'Pesticides', value: 'Pesticides', emoji: '🦠' },
    { label: 'Tools', value: 'Tools', emoji: '🛠️' },
  ];

  const apiError = createMutation.error?.message || updateMutation.error?.message;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // React Table Columns
  const columns = useMemo<ColumnDef<IMaterial>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Supply Name',
        cell: ({ row }) => (
          <span style={{ fontWeight: 600, color: '#fff' }}>{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Category',
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <span className="glass-badge glass-badge-muted">
              {type === 'Seeds' && '🌱 '}
              {type === 'Fertilizers' && '🧪 '}
              {type === 'Pesticides' && '🦠 '}
              {type === 'Tools' && '🛠️ '}
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'currentStock',
        header: 'Current Stock (Unit)',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const material = row.original;
          const isLowStock = material.currentStock < material.safetyStock;
          return (
            <span style={{ fontWeight: 700 }}>
              <span style={{ color: isLowStock ? 'var(--warning)' : 'var(--foreground)' }}>
                {material.currentStock}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: 'safetyStock',
        header: 'Safety Stock (Unit)',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {row.original.safetyStock}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const material = row.original;
          const isLowStock = material.currentStock < material.safetyStock;
          return isLowStock ? (
            <span className="glass-badge glass-badge-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '0.25rem' }}
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Low Stock
            </span>
          ) : (
            <span className="glass-badge glass-badge-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '0.25rem' }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Healthy
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div style={{ textAlign: 'right' }}>Actions</div>,
        cell: ({ row }) => (
          <div style={{ textAlign: 'right' }}>
            <button
              className="glass-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => handleOpenEditModal(row.original)}
              aria-label={`Edit ${row.original.name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '0.25rem' }}
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Material Catalog</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            Registered warehouse items, inventory levels, and threshold limits
          </p>
        </div>
        <button
          className="glass-btn glass-btn-primary"
          onClick={handleOpenAddModal}
          aria-label="Add new catalog material"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Supply</span>
        </button>
      </div>

      {/* Filter and Search Bar controls row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search catalog materials by name..."
              className="glass-input"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search materials by name"
              id="material-search-input"
            />
          </div>
          <button className="glass-btn" onClick={() => refetch()} aria-label="Refresh catalog list">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
          {categories.map((category) => {
            const isSelected = selectedType === category.value;
            return (
              <button
                key={category.value}
                onClick={() => setSelectedType(category.value)}
                className={`glass-btn ${isSelected ? 'glass-btn-primary' : ''}`}
                style={{ borderRadius: '9999px', padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                aria-label={`Filter by ${category.label}`}
              >
                <span>{category.emoji}</span>
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="glass-panel glass-card">
        <GenericTable
          data={filteredMaterials}
          columns={columns}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyStateText="No catalog supplies found matching the selection criteria."
        />
      </div>

      {/* Catalog Form Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="glass-panel glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow:
                '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {isEditMode ? 'Edit Catalog Supply' : 'Register New Supply'}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Error Message Box */}
            {apiError && (
              <div
                className="glass-glow-danger"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#fecaca',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Modal Form */}
            <GenericForm
              schema={MaterialFormSchema}
              defaultValues={
                isEditMode && editingMaterial
                  ? {
                      name: editingMaterial.name,
                      type: editingMaterial.type,
                      uom: editingMaterial.uom,
                      safetyStock: editingMaterial.safetyStock,
                    }
                  : {
                      name: '',
                      type: 'Seeds',
                      uom: '',
                      safetyStock: 0,
                    }
              }
              onSubmit={onSubmit}
            >
              {({ register: formRegister, formState: { errors } }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <FormFieldItem
                    label="Supply Item Name"
                    name="name"
                    error={errors.name?.message}
                    register={formRegister('name')}
                    placeholder="e.g. Premium Jasmine Rice Seeds"
                    required
                  />

                  <FormFieldItem
                    label="Supply Category"
                    name="type"
                    error={errors.type?.message}
                    register={formRegister('type')}
                    as="select"
                    required
                    style={{
                      appearance: 'none',
                      background:
                        'rgba(24, 24, 27, 0.6) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m4 6 4 4 4-4\'/%3E%3C/svg%3E") no-repeat right 1rem center',
                    }}
                  >
                    <option value="Seeds" style={{ background: '#121216' }}>
                      🌱 Seeds
                    </option>
                    <option value="Fertilizers" style={{ background: '#121216' }}>
                      🧪 Fertilizers
                    </option>
                    <option value="Pesticides" style={{ background: '#121216' }}>
                      🦠 Pesticides
                    </option>
                    <option value="Tools" style={{ background: '#121216' }}>
                      🛠️ Tools
                    </option>
                  </FormFieldItem>

                  <FormFieldItem
                    label="Unit of Measurement (UOM)"
                    name="uom"
                    error={errors.uom?.message}
                    register={formRegister('uom')}
                    placeholder="e.g. kg, bags, liters, units"
                    required
                  />

                  <FormFieldItem
                    label="Safety Stock Alert Threshold"
                    name="safetyStock"
                    error={errors.safetyStock?.message}
                    register={formRegister('safetyStock', { valueAsNumber: true })}
                    placeholder="0"
                    type="number"
                    min="0"
                    required
                  />

                  {/* Action Buttons Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.75rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    <button
                      type="button"
                      className="glass-btn"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glass-btn glass-btn-primary"
                      disabled={isSaving}
                      style={{ minWidth: '100px' }}
                    >
                      {isSaving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span
                            className="spinner"
                            style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid #fff',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite',
                            }}
                          ></span>
                          Saving...
                        </span>
                      ) : (
                        <span>Save Supply</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </GenericForm>
          </div>
        </div>
      )}

      {/* Global CSS spinner keyframe */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
