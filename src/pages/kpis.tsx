import React, { useState } from 'react';
import Head from 'next/head';
import { useKpis } from '@/contexts/KpiContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import KpiCard from '@/components/KpiCard';

export default function KpisPage() {
  const {
    kpis,
    loading,
    error,
    refreshKpis
  } = useKpis();
  
  // State for filtering KPIs
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Handle KPI deletion
  const handleDeleteKpi = async (id: number) => {
    try {
      // API endpoint would go here in a real implementation
      alert('Delete functionality would be implemented with API endpoint');
      refreshKpis();
    } catch (error) {
      console.error('Error deleting KPI:', error);
    }
  };
  
  // Filter KPIs based on status filter
  const filteredKpis = kpis.filter(kpi => 
    statusFilter === 'all' || kpi.status === statusFilter
  );
  
  return (
    <>
      <Head>
        <title>KPIs | IX Projects</title>
        <meta name="description" content="Key Performance Indicators for IX Projects" />
      </Head>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Key Performance Indicators</h1>
        <p className="text-gray-600">Track and monitor KPIs across IX projects</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="ml-auto self-end">
            <button
              className="btn btn-primary"
              onClick={refreshKpis}
            >
              Refresh KPIs
            </button>
          </div>
        </div>
      </div>
      
      {/* Show loading state, but don't block rendering */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center mb-4">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-gray-500">Loading KPIs...</p>
        </div>
      ) : null}
      
      {/* Show errors as warnings but continue showing the UI */}
      {error ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 mb-4">
          <h3 className="text-base font-medium mb-1">Connection Notice</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}
      
      {/* KPI Cards */}
      {filteredKpis.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No KPIs found</h3>
          <p className="text-gray-500 mb-6">
            {statusFilter !== 'all' 
              ? `No KPIs with status "${statusFilter}" found` 
              : 'No KPIs have been defined yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredKpis.map(kpi => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              onDelete={handleDeleteKpi}
            />
          ))}
        </div>
      )}
    </>
  );
}