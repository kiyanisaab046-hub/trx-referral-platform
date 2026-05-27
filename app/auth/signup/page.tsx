'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import styles from './signup.module.css';

const countries = [
  { name: "Pakistan", code: "+92", iso: "PK", flag: "🇵🇰" },
  { name: "India", code: "+91", iso: "IN", flag: "🇮🇳" },
  { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
  { name: "United Arab Emirates", code: "+971", iso: "AE", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "+966", iso: "SA", flag: "🇸🇦" },
  { name: "Afghanistan", code: "+93", iso: "AF", flag: "🇦🇫" },
  { name: "Bangladesh", code: "+880", iso: "BD", flag: "🇧🇩" },
  { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
  { name: "Germany", code: "+49", iso: "DE", flag: "🇩🇪" },
  { name: "France", code: "+33", iso: "FR", flag: "🇫🇷" },
  { name: "Turkey", code: "+90", iso: "TR", flag: "🇹🇷" },
  { name: "Nigeria", code: "+234", iso: "NG", flag: "🇳🇬" },
  { name: "South Africa", code: "+27", iso: "ZA", flag: "🇿🇦" },
  { name: "Malaysia", code: "+60", iso: "MY", flag: "🇲🇾" },
  { name: "Indonesia", code: "+62", iso: "ID", flag: "🇮🇩" },
  { name: "Russia", code: "+7", iso: "RU", flag: "🇷🇺" },
  { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
];

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

// Prefill sponsor code from referral link if present
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setSponsorCode(ref);
  }
}, []);

    const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  // Validate terms acceptance
  if (!agreeTerms) {
    setError('You must accept the terms and conditions to proceed.');
    setLoading(false);
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const cleanNumber = phoneNumber.trim().replace(/^0+/, '');
    const fullPhoneNumber = `${selectedCountry.code}${cleanNumber}`;

    // Step 1: Sign up in Supabase Auth
    // Validate sponsor code before proceeding
    if (sponsorCode) {
      const { data: sponsorUser, error: sponsorCheckErr } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', sponsorCode)
        .single();
      if (sponsorCheckErr || !sponsorUser?.id) {
        setError('Invalid sponsor/referral code provided.');
        setLoading(false);
        return;
      }
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: fullPhoneNumber,
          sponsor_code: sponsorCode || null,
        },
      },
    });
    if (signUpError) throw signUpError;

    // Insert referral relationship (level 1 – direct) if sponsor code provided
// Insert referral relationship (level 1 – direct) if sponsor code provided
if (sponsorCode) {
  const { data: sponsorUser, error: sponsorErr } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', sponsorCode)
    .single();
  if (sponsorErr || !sponsorUser?.id) {
    throw sponsorErr ?? new Error('Sponsor not found');
  }
  // Insert referral relationship
  const { error: refErr } = await supabase
    .from('referrals')
    .insert({
      sponsor_id: sponsorUser.id,
      referred_id: data.user?.id,
      level: 1,
    });
  if (refErr) throw refErr;
}
    setSuccess(true);
    setTimeout(() => router.push('/auth/signin'), 3000);
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

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Country</label>
              <select
                className={styles.select}
                value={selectedCountry.iso}
                onChange={(e) => {
                  const found = countries.find(c => c.iso === e.target.value);
                  if (found) {
                    setSelectedCountry(found);
                  }
                }}
              >
                {countries.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>Phone Number</label>
              <div className={styles.phoneInputGroup}>
                <div className={styles.phonePrefix}>
                  {selectedCountry.flag} {selectedCountry.code}
                </div>
                <input
                  type="tel"
                  className={styles.phoneInput}
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

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
          <p>Already have an account? <a href="/auth/signin" className={styles.link}>Sign In</a></p>
          


        </div>
      </Card>
    </div>
  );
}
