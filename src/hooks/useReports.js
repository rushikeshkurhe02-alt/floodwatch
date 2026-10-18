import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isConfigured } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useReports({ onReportVerified } = {}) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [userConfirmations, setUserConfirmations] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyVerifiedId, setRecentlyVerifiedId] = useState(null);

  // Keep a ref to the latest reports list to check previous status during realtime updates
  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  // Keep a ref to onReportVerified callback
  const onReportVerifiedRef = useRef(onReportVerified);
  onReportVerifiedRef.current = onReportVerified;

  // Fetch reports from Supabase
  const fetchReports = useCallback(async () => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setReports(data || []);
    } catch (err) {
      console.error('FloodWatch fetchReports error:', err);
      setError(err.message || 'Failed to load flood reports');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user confirmations when user changes
  const fetchUserConfirmations = useCallback(async () => {
    if (!isConfigured || !supabase || !user) {
      setUserConfirmations(new Set());
      return;
    }

    try {
      const { data, error: confErr } = await supabase
        .from('confirmations')
        .select('report_id')
        .eq('user_id', user.id);

      if (confErr) {
        console.warn('Failed to load user confirmations:', confErr.message);
        return;
      }

      const confirmedIds = new Set((data || []).map((c) => c.report_id));
      setUserConfirmations(confirmedIds);
    } catch (err) {
      console.warn('Error querying confirmations:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // User confirmations update
  useEffect(() => {
    fetchUserConfirmations();
  }, [fetchUserConfirmations]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!isConfigured || !supabase) return;

    const channel = supabase
      .channel('realtime:reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReport = payload.new;
            setReports((prev) => {
              // Prevent duplicate if already added locally
              if (prev.some((r) => r.id === newReport.id)) {
                return prev.map((r) => (r.id === newReport.id ? newReport : r));
              }
              return [newReport, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            const previous = reportsRef.current.find((r) => r.id === updated.id);

            // Check if status transitioned to verified
            if (previous && previous.status !== 'verified' && updated.status === 'verified') {
              setRecentlyVerifiedId(updated.id);
              if (onReportVerifiedRef.current) {
                onReportVerifiedRef.current(updated);
              }
              // Reset recently verified animation after 4 seconds
              setTimeout(() => {
                setRecentlyVerifiedId((current) => (current === updated.id ? null : current));
              }, 4000);
            }

            setReports((prev) => {
              const index = prev.findIndex((r) => r.id === updated.id);
              if (index === -1) {
                return [updated, ...prev];
              }
              const clone = [...prev];
              clone[index] = updated;
              return clone;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setReports((prev) => prev.filter((r) => r.id !== deletedId));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error for reports');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Submit a new flood report
  const createReport = async ({ latitude, longitude, severity, description }) => {
    if (!isConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const payload = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      severity,
      description: description?.trim() ? description.trim() : null,
    };

    const { data, error: insertErr } = await supabase
      .from('reports')
      .insert([payload])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    // Optimistically ensure report is in local state immediately
    if (data) {
      setReports((prev) => {
        if (prev.some((r) => r.id === data.id)) return prev;
        return [data, ...prev];
      });
    }

    return data;
  };

  // Confirm an existing report
  const confirmReport = async (reportId) => {
    if (!isConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }
    if (!user) {
      throw new Error('You must be logged in to confirm reports.');
    }

    const { error: insertErr } = await supabase
      .from('confirmations')
      .insert([
        {
          report_id: reportId,
          user_id: user.id,
        },
      ]);

    if (insertErr) {
      throw insertErr;
    }

    // Add to local confirmed set
    setUserConfirmations((prev) => new Set([...prev, reportId]));

    // Light optimistic update of count
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const nextCount = (r.confirmations_count || 0) + 1;
          const nextStatus = nextCount >= 3 ? 'verified' : r.status;
          return {
            ...r,
            confirmations_count: nextCount,
            status: nextStatus,
          };
        }
        return r;
      })
    );
  };

  return {
    reports,
    userConfirmations,
    loading,
    error,
    recentlyVerifiedId,
    refreshReports: fetchReports,
    createReport,
    confirmReport,
  };
}
