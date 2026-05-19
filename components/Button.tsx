// d:/trx/components/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export const Button: React.FC<Props> = ({ children, variant = 'primary', loading = false, disabled, ...rest }) => {
  const className = `${styles.button} ${styles[variant]} ${loading ? styles.loading : ''}`;
  return (
    <button className={className} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className={styles.spinner} aria-label="loading" />
      ) : (
        children
      )}
    </button>
  );
};
