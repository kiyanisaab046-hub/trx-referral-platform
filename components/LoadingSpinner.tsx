import React from 'react';
import styles from './LoadingSpinner.module.css';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<Props> = ({ size = 'medium' }) => {
  return (
    <div className={`${styles.spinnerContainer} ${styles[size]}`}>
      <div className={styles.spinner}></div>
    </div>
  );
};
