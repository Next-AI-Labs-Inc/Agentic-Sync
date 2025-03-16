import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { KPI } from '@/types';

interface KpiContextValue {
  kpis: KPI[];
  loading: boolean;
  error: string | null;
  refreshKpis: () => Promise<void>;
}

const KpiContext = createContext<KpiContextValue | undefined>(undefined);

export function KpiProvider({ children }: { children: ReactNode }) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshKpis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API first
      const response = await axios.get('/api/kpis');
      if (response.data && Array.isArray(response.data)) {
        setKpis(response.data);
      } else {
        console.warn('API returned non-array KPI data');
        
        // If we don't have any KPIs yet, use sample data
        if (kpis.length === 0) {
          // Fallback or sample KPIs
          setKpis([
            {
              id: 1,
              name: "Documentation Coverage",
              description: "Percentage of codebase components with proper documentation",
              target: "Increase documentation coverage across all projects",
              unit: "%",
              frequency: "monthly",
              status: "active",
              currentValue: "75",
              targetValue: "95",
              lastUpdated: "2025-03-15T00:50:00Z"
            },
            {
              id: 2,
              name: "Bug Resolution Time",
              description: "Average time from bug report to resolution",
              target: "Reduce average bug resolution time",
              unit: "days",
              frequency: "weekly",
              status: "active",
              currentValue: "5.3",
              targetValue: "2.5",
              lastUpdated: "2025-03-15T00:51:00Z"
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError('Failed to fetch KPIs. Using cached data.');
      
      // Use fallback data if we don't have any KPIs yet
      if (kpis.length === 0) {
        // Sample fallback KPIs
        setKpis([
          {
            id: 1,
            name: "Documentation Coverage",
            description: "Percentage of codebase components with proper documentation",
            target: "Increase documentation coverage across all projects",
            unit: "%",
            frequency: "monthly",
            status: "active",
            currentValue: "75",
            targetValue: "95",
            lastUpdated: "2025-03-15T00:50:00Z"
          },
          {
            id: 2,
            name: "Bug Resolution Time",
            description: "Average time from bug report to resolution",
            target: "Reduce average bug resolution time",
            unit: "days",
            frequency: "weekly",
            status: "active",
            currentValue: "5.3",
            targetValue: "2.5",
            lastUpdated: "2025-03-15T00:51:00Z"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshKpis();
    
    // Set up polling to periodically re-fetch KPIs
    const interval = setInterval(refreshKpis, 60000); // Try every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <KpiContext.Provider value={{ kpis, loading, error, refreshKpis }}>
      {children}
    </KpiContext.Provider>
  );
}

export function useKpis() {
  const context = useContext(KpiContext);
  if (context === undefined) {
    throw new Error('useKpis must be used within a KpiProvider');
  }
  return context;
}