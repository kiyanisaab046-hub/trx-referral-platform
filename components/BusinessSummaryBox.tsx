import React from 'react';
import styles from './BusinessSummaryBox.module.css';

type Props = {
  totalBusiness: number;
  direct: number;
  level: number;
  team: number;
  salary: number;
  reward: number;
};

const BusinessSummaryBox = ({ totalBusiness, direct, level, team, salary, reward }: Props) => {
  const items = [
    { label: 'Total Business', value: `$${totalBusiness.toFixed(2)}` },
    { label: 'Direct Income', value: `$${direct.toFixed(2)}` },
    { label: 'Level Income', value: `$${level.toFixed(2)}` },
    { label: 'Team Income', value: `$${team.toFixed(2)}` },
    { label: 'Salary Income', value: `$${salary.toFixed(2)}` },
    { label: 'Reward Income', value: `$${reward.toFixed(2)}` },
  ];

  return (
    <div className={styles.container}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BusinessSummaryBox;
