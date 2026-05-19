'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './signup.module.css';

export default function SignUp() {
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!agreeTerms) {
      setError('You must accept the terms and conditions to proceed.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            sponsor_code: sponsorCode || null,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.badgeWrapper}>
          <span className={styles.badge}>Professional Pack — $3</span>
        </div>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Create Member Account</h1>
          <p className={styles.subtitle}>Start building your passive income today</p>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <h3>Registration Successful!</h3>
            <p>Please check your email for the verification link. Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className={styles.form}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Sponsor Code (Optional)"
              type="text"
              placeholder="Enter sponsor referral code"
              value={sponsorCode}
              onChange={(e) => setSponsorCode(e.target.value)}
            />

            <div className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                I accept the <a href="#" className={styles.termsLink}>terms and conditions</a>
              </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <Button type="submit" loading={loading} className={styles.submitBtn}>
              Join Now • Just $3
            </Button>
          </form>
        )}

        <div className={styles.footer}>
          Already have an account? <a href="/signin" className={styles.link}>Sign In</a>
        </div>
      </Card>
    </div>
  );
}
