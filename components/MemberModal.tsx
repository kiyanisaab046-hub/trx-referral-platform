'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import styles from './MemberModal.module.css';

interface MemberModalProps {
  memberId: string;
  memberName: string;
  onClose: () => void;
}

interface MemberDetails {
  fullName: string;
  email: string;
  joinedAt: string;
  rank: number;
  rankName: string;
  teamSize: number;
  directCount: number;
  totalInvested: number;
}

const rankNames: Record<number, string> = {
  0: 'Unranked',
  1: 'Starter',
  2: 'Builder',
  3: 'Grower',
  4: 'Achiever',
  5: 'Advancer',
  6: 'Progressor',
  7: 'Leader',
  8: 'Pioneer',
  9: 'Champion',
  10: 'Legend',
};

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const MemberModal: React.FC<MemberModalProps> = ({ memberId, memberName, onClose }) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<MemberDetails | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, email, created_at')
          .eq('id', memberId)
          .single();

        // Fetch rank
        const { data: rankData } = await supabase
          .from('user_ranks')
          .select('rank')
          .eq('user_id', memberId)
          .single();

        // Fetch direct referral count
        const { count: directCount } = await supabase
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', memberId)
          .eq('level', 1);

        // Fetch team size via RPC
        let teamSize = 0;
        try {
          const { data: teamData } = await supabase
            .rpc('get_matrix_team_size', { user_uuid: memberId });
          teamSize = teamData || 0;
        } catch {
          teamSize = 0;
        }

        const rank = rankData?.rank || 0;

        setDetails({
          fullName: profile?.full_name || memberName,
          email: profile?.email || 'N/A',
          joinedAt: profile?.created_at || '',
          rank,
          rankName: rankNames[rank] || 'Unranked',
          teamSize,
          directCount: directCount || 0,
          totalInvested: 0,
        });
      } catch (err) {
        console.error('Error fetching member details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [memberId, memberName, supabase]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading member info...</p>
          </div>
        ) : details ? (
          <>
            {/* Avatar & Name */}
            <div className={styles.profileSection}>
              <div className={styles.avatarLarge}>
                {getInitials(details.fullName)}
              </div>
              <h3 className={styles.memberName}>{details.fullName}</h3>
              <span className={styles.rankBadge}>{details.rankName}</span>
            </div>

            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📅</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Joined</span>
                  <span className={styles.infoValue}>
                    {details.joinedAt
                      ? new Date(details.joinedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👥</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Team Size</span>
                  <span className={styles.infoValue}>{details.teamSize} members</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🤝</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Direct Referrals</span>
                  <span className={styles.infoValue}>{details.directCount}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏆</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Current Rank</span>
                  <span className={styles.infoValue}>Rank {details.rank}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>Could not load member details.</p>
        )}
      </div>
    </div>
  );
};
