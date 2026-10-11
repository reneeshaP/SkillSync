import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { dashboardService } from '../services/dashboard.service';

const DashboardStatsContext = createContext(null);

export function DashboardStatsProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  const refetch = useCallback(() => {
    setError(false);
    dashboardService.getStats().then(setStats).catch(() => setError(true));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <DashboardStatsContext.Provider value={{ stats, error, refetch }}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

DashboardStatsProvider.propTypes = {
  children: PropTypes.node,
};

export function useDashboardStats() {
  const ctx = useContext(DashboardStatsContext);
  if (!ctx) throw new Error('useDashboardStats must be used within a DashboardStatsProvider');
  return ctx;
}
