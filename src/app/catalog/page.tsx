'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Standard TypeScript definitions decoupled from serverless Mongoose modules
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

// Zod validation schema for creating/updating a material
const MaterialFormSchema = z.object({
  name: z.string({ required_error: 'Material name is required' }).trim().min(1, 'Material name cannot be empty'),
  type: z.enum(['Seeds', 'Fertilizers', 'Pesticides', 'Tools'], {
    errorMap: () => ({ message: 'Material type must be one of: Seeds, Fertilizers, Pesticides, Tools' }),
  }),
  uom: z.string({ required_error: 'Unit of Measurement (UOM) is required' }).trim().min(1, 'UOM cannot be empty'),
  safetyStock: z.number({ required_error: 'Safety Stock is required', invalid_type_error: 'Safety Stock must be a number' }).min(0, 'Safety Stock must be non-negative'),
});

type MaterialFormValues = z.infer<typeof MaterialFormSchema>;

// Fetcher function
const fetchMaterials = async (): Promise<IApiResponse<IMaterial[]>> => {
  const res = await fetch('/api/materials');
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch catalog materials');
  }
  return res.json();
};

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<IMaterial | null>(null);

  // React Hook Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MaterialFormValues>({
    resolver: zodResolver(MaterialFormSchema),
    defaultValues: {
      name: '',
      type: 'Seeds',
      uom: '',
      safetyStock: 0,
    }
  });

  // TanStack React Query GET Catalog
  const { data, isLoading, error, refetch } = useQuery<IApiResponse<IMaterial[]>, Error>({
    queryKey: queryKeys.materials.all,
    queryFn: fetchMaterials,
  });

  // TanStack Query Mutations
  const createMutation = useMutation<IApiResponse<IMaterial>, Error, MaterialFormValues>({
    mutationFn: async (newMaterial) => {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'Manager', // Simulated admin header
        },
        body: JSON.stringify(newMaterial),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create material');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation<IApiResponse<IMaterial>, Error, { id: string; data: MaterialFormValues }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'Manager', // Simulated admin header
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update material');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      handleCloseModal();
    },
  });

  // Modal Handlers
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingMaterial(null);
    reset({
      name: '',
      type: 'Seeds',
      uom: '',
      safetyStock: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: IMaterial) => {
    setIsEditMode(true);
    setEditingMaterial(material);
    reset({
      name: material.name,
      type: material.type,
      uom: material.uom,
      safetyStock: material.safetyStock,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    reset();
    createMutation.reset();
    updateMutation.reset();
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
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  const categories: { label: string; value: string; emoji: string }[] = [
    { label: 'All Supplies', value: 'All', emoji: '📦' },
    { label: 'Seeds', value: 'Seeds', emoji: '🌱' },
    { label: 'Fertilizers', value: 'Fertilizers', emoji: '🧪' },
    { label: 'Pesticides', value: 'Pesticides', emoji: '🦠' },
    { label: 'Tools', value: 'Tools', emoji: '🛠️' },
  ];

  const apiError = createMutation.error?.message || updateMutation.error?.message;
  const isSaving = createMutation.isPending || updateMutation.isPending;

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        {/* Loading skeleton state */}
        {isLoading && (
          <div style={{ padding: '1rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem' }}>Supply Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Current Stock</th>
                  <th style={{ padding: '1rem' }}>Safety Stock</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '200px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '80px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '60px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '60px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '100px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                      <div className="skeleton-pulse" style={{ height: '1.25rem', width: '60px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', marginLeft: 'auto' }}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Error UI state */}
        {error && (
          <div className="glass-glow-danger" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Database Sync Failure</h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', maxWidth: '400px' }}>
              {error.message || 'An error occurred while loading the inventory catalog records.'}
            </p>
            <button className="glass-btn glass-btn-primary" onClick={() => refetch()} style={{ marginTop: '0.5rem' }}>
              Retry Catalog Sync
            </button>
          </div>
        )}

        {/* Catalog Table list */}
        {!isLoading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem' }}>Supply Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Current Stock</th>
                  <th style={{ padding: '1rem' }}>Safety Stock</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      <div style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>🔍</div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>No items found</p>
                      <p style={{ fontSize: '0.85rem' }}>Try refining your search terms or selecting another catalog category filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => {
                    const isLowStock = material.currentStock < material.safetyStock;
                    
                    return (
                      <tr
                        key={material._id}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition-smooth)' }}
                        className="catalog-row"
                      >
                        <td style={{ padding: '1.15rem 1rem', fontWeight: 600, color: '#fff' }}>
                          {material.name}
                        </td>
                        <td style={{ padding: '1.15rem 1rem' }}>
                          <span className="glass-badge glass-badge-muted">
                            {material.type === 'Seeds' && '🌱 '}
                            {material.type === 'Fertilizers' && '🧪 '}
                            {material.type === 'Pesticides' && '🦠 '}
                            {material.type === 'Tools' && '🛠️ '}
                            {material.type}
                          </span>
                        </td>
                        <td style={{ padding: '1.15rem 1rem', fontWeight: 700 }}>
                          <span style={{ color: isLowStock ? 'var(--warning)' : 'var(--foreground)' }}>
                            {material.currentStock}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginLeft: '0.25rem', fontWeight: 400 }}>
                            {material.uom}
                          </span>
                        </td>
                        <td style={{ padding: '1.15rem 1rem', color: 'var(--muted-foreground)' }}>
                          {material.safetyStock}
                          <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                            {material.uom}
                          </span>
                        </td>
                        <td style={{ padding: '1.15rem 1rem' }}>
                          {isLowStock ? (
                            <span className="glass-badge glass-badge-warning">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              Low Stock
                            </span>
                          ) : (
                            <span className="glass-badge glass-badge-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Healthy
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1.15rem 1rem', textAlign: 'right' }}>
                          <button
                            className="glass-btn"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => handleOpenEditModal(material)}
                            aria-label={`Edit ${material.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
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
            // Close modal on backdrop click
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
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.05)',
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Field: Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  Supply Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premium Jasmine Rice Seeds"
                  className="glass-input"
                  style={{
                    borderColor: errors.name ? 'var(--danger)' : 'var(--border)',
                    boxShadow: errors.name ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                  {...register('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.125rem' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Field: Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  Supply Category
                </label>
                <select
                  className="glass-input"
                  style={{
                    borderColor: errors.type ? 'var(--danger)' : 'var(--border)',
                    boxShadow: errors.type ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none',
                    appearance: 'none',
                    background: 'rgba(24, 24, 27, 0.6) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m4 6 4 4 4-4\'/%3E%3C/svg%3E") no-repeat right 1rem center'
                  }}
                  {...register('type')}
                  aria-invalid={errors.type ? 'true' : 'false'}
                >
                  <option value="Seeds" style={{ background: '#121216' }}>🌱 Seeds</option>
                  <option value="Fertilizers" style={{ background: '#121216' }}>🧪 Fertilizers</option>
                  <option value="Pesticides" style={{ background: '#121216' }}>🦠 Pesticides</option>
                  <option value="Tools" style={{ background: '#121216' }}>🛠️ Tools</option>
                </select>
                {errors.type && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.125rem' }}>
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Field: UOM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  Unit of Measurement (UOM)
                </label>
                <input
                  type="text"
                  placeholder="e.g. kg, bags, liters, units"
                  className="glass-input"
                  style={{
                    borderColor: errors.uom ? 'var(--danger)' : 'var(--border)',
                    boxShadow: errors.uom ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                  {...register('uom')}
                  aria-invalid={errors.uom ? 'true' : 'false'}
                />
                {errors.uom && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.125rem' }}>
                    {errors.uom.message}
                  </p>
                )}
              </div>

              {/* Field: Safety Stock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  Safety Stock Alert Threshold
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  className="glass-input"
                  style={{
                    borderColor: errors.safetyStock ? 'var(--danger)' : 'var(--border)',
                    boxShadow: errors.safetyStock ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                  {...register('safetyStock', { valueAsNumber: true })}
                  aria-invalid={errors.safetyStock ? 'true' : 'false'}
                />
                {errors.safetyStock && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.125rem' }}>
                    {errors.safetyStock.message}
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
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
                      <span className="spinner" style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></span>
                      Saving...
                    </span>
                  ) : (
                    <span>Save Supply</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS spinner keyframe */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
