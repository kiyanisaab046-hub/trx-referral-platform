'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './signin.module.css';
import Link from 'next/link';

export default function SignIn() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // Successfully authenticated
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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
        ease: [0.16, 1, 0.3, 1], // Custom ultra-smooth cubic bezier easeOut
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
      {/* Decorative ambient gold radial light blobs */}
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
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Enter your account details to access your dashboard</p>
          </motion.div>

          <form onSubmit={handleLogin} className={styles.form}>
            <motion.div variants={itemVariants}>
              <Input
                label="Email Address"
                type="text"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className={styles.passwordWrapper}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🔒 Hide' : '🔑 Show'}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.options}>
              <label className={styles.rememberMe}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot password?</a>
            </motion.div>

            <AnimatePresence>
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
            </AnimatePresence>

            <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-3">
              <Button type="submit" loading={loading} className={styles.submitBtn}>
                Sign In →
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                className={styles.backBtn} 
                onClick={() => router.push('/')}
              >
                Back to Homepage
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className={styles.footer}>
            Don't have an account yet? <Link href="/signup" className={styles.link}>Register NOW</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
