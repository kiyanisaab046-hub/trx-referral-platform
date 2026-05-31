import React from 'react';
import styles from './LoadingSpinner.module.css';

type Props = {
  size?: 'small' | 'large';
};

export const LoadingSpinner: React.FC<Props> = ({ size = 'small' }) => (
  <div className={`${styles.spinner} ${size === 'large' ? styles.large : ''}`} />
);

export default LoadingSpinner;
