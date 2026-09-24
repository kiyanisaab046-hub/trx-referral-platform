'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './forgot-password.module.css';
import Link from 'next/link';

export default function ForgotPassword() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      // 1. Verify if email exists in the users database
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!checkRes.ok) {
        throw new Error('Could not verify email. Please try again.');
      }

      const { exists, error: checkError } = await checkRes.json();
      if (checkError) throw new Error(checkError);

      if (!exists) {
        setError('This email address is not registered in our system.');
        setLoading(false);
        return;
      }

      // 2. Trigger Supabase password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        targetEmail,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSuccess('We have sent a secure password reset link to your email.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter your email to receive a recovery link</p>
          </motion.div>

          <form onSubmit={handleResetRequest} className={styles.form}>
            <motion.div variants={itemVariants}>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                  📩 {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-3">
              <Button type="submit" loading={loading} className={styles.submitBtn}>
                Send Reset Link →
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                className={styles.backBtn} 
                onClick={() => router.push('/signin')}
              >
                Back to Sign In
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className={styles.footer}>
            Need assistance? Contact support or <Link href="/signup" className={styles.link}>Register a new account</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
