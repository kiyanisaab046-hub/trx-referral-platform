'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import styles from './signin.module.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // In a real app we'd set an HTTP-only cookie via API here.
      // For now, redirecting to dashboard.
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className={styles.passwordWrapper}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className={styles.forgotPassword}>Forgot password?</a>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" loading={loading} className={styles.submitBtn}>
            Login →
          </Button>
          
          <Button type="button" variant="secondary" className={styles.backBtn} onClick={() => router.push('/')}>
            Back to Homepage
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? <a href="/auth/signup" className={styles.link}>Register NOW</a></p>

          <div className="mt-8 pt-6 border-t border-primary/20 text-center">
            <p className="text-xs text-soft-gray uppercase tracking-wider font-bold mb-2">Admin Panel Access</p>
            <div className="bg-black/30 border border-primary/10 rounded-xl p-4 inline-block text-left text-sm text-gray-300">
              <p><strong>Email:</strong> zkiyani770@gmail.com</p>
              <p><strong>Pass:</strong> Kiyani@786?</p>
              <a href="/admin" className="text-primary hover:text-highlight mt-2 inline-block font-bold">Go to Admin Dashboard &rarr;</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
