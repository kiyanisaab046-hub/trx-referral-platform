// BusinessSummaryBox.tsx - Premium summary box for company total business
import React from 'react';
import styles from './BusinessSummaryBox.module.css';

interface Props {
  totalBusiness: number;
  direct: number;
  level: number;
  team: number;
  salary: number;
  reward: number;
}

const BusinessSummaryBox: React.FC<Props> = ({ totalBusiness, direct, level, team, salary, reward }) => {
  const items = [
    { label: 'Total Business', value: totalBusiness },
    { label: 'Direct Income', value: direct },
    { label: 'Level Income', value: level },
    { label: 'Team Income', value: team },
    { label: 'Salary Income', value: salary },
    { label: 'Reward Income', value: reward },
  ];

  return (
    <div className={styles.summaryBox}>
      <h3 className={styles.title}>Company Business Summary</h3>
      <div className={styles.grid}>
        {items.map((it) => (
          <div key={it.label} className={styles.item}>
            <span className={styles.label}>{it.label}</span>
            <span className={styles.value}>${it.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessSummaryBox;
