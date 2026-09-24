'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './reset-password.module.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/signin?error=' + encodeURIComponent('Access denied. Please use the password reset link from your email.'));
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        router.push('/signin?error=' + encodeURIComponent('Failed to verify recovery session.'));
      }
    };
    checkSession();
  }, [router, supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Sign out to clear the temporary reset password session
      await supabase.auth.signOut();

      setSuccess('Your password has been successfully updated.');
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stagger animation container
  const containerVariants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  if (checkingSession) {
    return (
      <div className={styles.container}>
        <div className={styles.glowBlob1} />
        <div className={styles.glowBlob2} />
        <div className="text-center text-primary font-bold text-lg z-10">
          Verifying security session...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Decorative ambient radial light blobs */}
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.cardWrapper}
      >
        <div className={styles.card}>
          {/* Top Brand Pill Indicator */}
          <motion.div variants={itemVariants} className={styles.brandBadge}>
            <span className={styles.badgeText}>UIP — SECURE ACCESS</span>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.header}>
            <h1 className={styles.title}>New Password</h1>
            <p className={styles.subtitle}>Enter and confirm your new account password</p>
          </motion.div>

          <form onSubmit={handlePasswordUpdate} className={styles.form}>
            <motion.div variants={itemVariants} className={styles.passwordWrapper}>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.passwordWrapper}>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.error}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.success}
                >
                  ✅ {success} Redirecting...
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-3">
              <Button type="submit" loading={loading} className={styles.submitBtn}>
                Update Password →
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
