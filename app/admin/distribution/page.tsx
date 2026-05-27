'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../admin.module.css';

type Tab = 'direct' | 'level' | 'team' | 'salary' | 'reward' | 'maintenance';

export default function DistributionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('direct');
  const [loading, setLoading] = useState(true);
  const [directCommissions, setDirectCommissions] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('commissions')
          .select(`
            id, amount, created_at, type,
            user:users!commissions_user_id_fkey(full_name, email),
            from_user:users!commissions_from_user_id_fkey(full_name, email)
          `)
          .in('type', ['commission_direct', 'commission_maintenance'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setDirectCommissions(data.filter(d => d.type === 'commission_direct'));
          setMaintenanceRecords(data.filter(d => d.type === 'commission_maintenance'));
        }
      } catch (err: any) {
        console.error('Error fetching distributions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'direct', label: 'Direct Income (20%)' },
    { id: 'level', label: 'Level Income' },
    { id: 'team', label: 'Team Income' },
    { id: 'salary', label: 'Weekly Salary' },
    { id: 'reward', label: 'Reward Income' },
    { id: 'maintenance', label: 'Maintenance (5%)' },
  ];

  const renderUnderConstruction = (title: string) => (
    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
      <h2 style={{ color: '#aaa', marginBottom: '1rem' }}>{title}</h2>
      <p style={{ color: '#666' }}>This distribution module is currently under construction.</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Income Distribution & Tracking</h2>
        <p style={{ color: '#888' }}>Monitor the 6-way income blueprint distributions across the platform.</p>
      </div>

      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #00d2ff, #0080ff)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : '#aaa',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderRadius: '8px', marginBottom: '2rem' }}>
          Error: {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className={styles.card} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px' }}>
          
          {/* Direct Income Tab */}
          {activeTab === 'direct' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Global Direct Income Tracking</h3>
              {directCommissions.length === 0 ? (
                <p style={{ color: '#666' }}>No direct income distributions found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#aaa', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Receiver (Sponsor)</th>
                        <th style={{ padding: '1rem' }}>From Investor</th>
                        <th style={{ padding: '1rem' }}>Amount Distributed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directCommissions.map(comm => (
                        <tr key={comm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: '#ccc' }}>
                            {new Date(comm.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500, color: '#fff' }}>{comm.user?.full_name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{comm.user?.email || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#ccc' }}>{comm.from_user?.full_name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{comm.from_user?.email || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#2ecc71', fontWeight: 600 }}>
                            +${Number(comm.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Maintenance Tax Tab */}
          {activeTab === 'maintenance' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Platform Maintenance Deductions</h3>
              <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This shows the 5% company tax deducted from every investment.</p>
              {maintenanceRecords.length === 0 ? (
                <p style={{ color: '#666' }}>No maintenance deductions found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#aaa', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Investor User</th>
                        <th style={{ padding: '1rem' }}>Description</th>
                        <th style={{ padding: '1rem' }}>Amount Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRecords.map(rec => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem', color: '#ccc' }}>
                            {new Date(rec.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500, color: '#fff' }}>{rec.user?.full_name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{rec.user?.email || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#ccc' }}>
                            5% Maintenance Tax Deduction
                          </td>
                          <td style={{ padding: '1rem', color: '#f39c12', fontWeight: 600 }}>
                            ${Number(rec.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Under Construction Tabs */}
          {activeTab === 'level' && renderUnderConstruction('Level Income')}
          {activeTab === 'team' && renderUnderConstruction('Team Income')}
          {activeTab === 'salary' && renderUnderConstruction('Weekly Salary')}
          {activeTab === 'reward' && renderUnderConstruction('Reward Income')}

        </div>
      )}
    </div>
  );
}
