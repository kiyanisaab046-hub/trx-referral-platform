'use client';

import React, { useState } from 'react';
import styles from './LevelIncome.module.css';

export interface LevelMember {
  id: string;
  name: string;
  joinedAt?: string;
}

export interface LevelGroup {
  level: number;
  members: LevelMember[];
}

interface LevelIncomeProps {
  levels: LevelGroup[];
  totalMembers: number;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const levelColors = [
  { gradient: 'linear-gradient(135deg, #00d2ff, #0080ff)', glow: 'rgba(0, 210, 255, 0.3)', text: '#00d2ff', bg: 'rgba(0, 210, 255, 0.1)', border: 'rgba(0, 210, 255, 0.2)' },
  { gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)', glow: 'rgba(46, 204, 113, 0.3)', text: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)', border: 'rgba(46, 204, 113, 0.2)' },
  { gradient: 'linear-gradient(135deg, #f39c12, #e67e22)', glow: 'rgba(243, 156, 18, 0.3)', text: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)', border: 'rgba(243, 156, 18, 0.2)' },
  { gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)', glow: 'rgba(231, 76, 60, 0.3)', text: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)', border: 'rgba(231, 76, 60, 0.2)' },
  { gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)', glow: 'rgba(155, 89, 182, 0.3)', text: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)', border: 'rgba(155, 89, 182, 0.2)' },
  { gradient: 'linear-gradient(135deg, #1abc9c, #16a085)', glow: 'rgba(26, 188, 156, 0.3)', text: '#1abc9c', bg: 'rgba(26, 188, 156, 0.1)', border: 'rgba(26, 188, 156, 0.2)' },
  { gradient: 'linear-gradient(135deg, #e91e63, #c2185b)', glow: 'rgba(233, 30, 99, 0.3)', text: '#e91e63', bg: 'rgba(233, 30, 99, 0.1)', border: 'rgba(233, 30, 99, 0.2)' },
  { gradient: 'linear-gradient(135deg, #ff9800, #f57c00)', glow: 'rgba(255, 152, 0, 0.3)', text: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)', border: 'rgba(255, 152, 0, 0.2)' },
];

const getLevelColor = (level: number) => {
  return levelColors[(level - 1) % levelColors.length];
};

const LevelCard: React.FC<{ group: LevelGroup }> = ({ group }) => {
  const [expanded, setExpanded] = useState(group.level <= 2);
  const color = getLevelColor(group.level);

  return (
    <div className={styles.levelCard} style={{ borderColor: color.border }}>
      <div
        className={styles.levelHeader}
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.levelTitleRow}>
          <div className={styles.levelBadge} style={{ background: color.gradient, boxShadow: `0 4px 15px ${color.glow}` }}>
            L{group.level}
          </div>
          <div className={styles.levelInfo}>
            <h3 className={styles.levelTitle} style={{ color: color.text }}>
              Level {group.level}
            </h3>
            <span className={styles.levelSubtitle}>
              {group.level === 1 ? 'Direct Referrals' : `Indirect — Depth ${group.level}`}
            </span>
          </div>
        </div>
        <div className={styles.levelStats}>
          <div className={styles.memberCount} style={{ color: color.text }}>
            {group.members.length}
          </div>
          <div className={styles.memberLabel}>
            {group.members.length === 1 ? 'Member' : 'Members'}
          </div>
          <span className={`${styles.expandIcon} ${expanded ? styles.expandIconOpen : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {expanded && (
        <div className={styles.membersGrid}>
          {group.members.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.memberAvatar} style={{ background: color.gradient, boxShadow: `0 2px 10px ${color.glow}` }}>
                {getInitials(member.name)}
              </div>
              <div className={styles.memberInfo}>
                <p className={styles.memberName} title={member.name}>{member.name}</p>
                {member.joinedAt && (
                  <span className={styles.memberDate}>
                    {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
              <div className={styles.levelTag} style={{ background: color.bg, color: color.text, borderColor: color.border }}>
                L{group.level}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const LevelIncome: React.FC<LevelIncomeProps> = ({ levels, totalMembers }) => {
  if (!levels || levels.length === 0) return null;

  return (
    <div className={styles.container}>
      {/* Summary Bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{totalMembers}</span>
          <span className={styles.summaryLabel}>Total Members</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{levels.length}</span>
          <span className={styles.summaryLabel}>Active Levels</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{levels[0]?.members.length || 0}</span>
          <span className={styles.summaryLabel}>Direct Referrals</span>
        </div>
      </div>

      {/* Level Cards */}
      <div className={styles.levelsContainer}>
        {levels.map((group) => (
          <LevelCard key={group.level} group={group} />
        ))}
      </div>
    </div>
  );
};
