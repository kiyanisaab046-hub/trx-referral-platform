'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './signup.module.css';
import Link from 'next/link';

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
  const supabase = createClient();
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

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setSponsorCode(ref.toUpperCase());
      }
    }
  }, []);

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
      const cleanNumber = phoneNumber.trim().replace(/^0+/, '');
      const fullPhoneNumber = `${selectedCountry.code}${cleanNumber}`;

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

      // Ensure we have a valid user ID before proceeding
      const userId = data.user?.id;
      if (!userId) {
        console.error('User ID missing after signup');
        throw new Error('Registration failed: missing user ID');
      }

      // Insert referral relationship (level 1 – direct) if sponsor code provided
      if (sponsorCode) {
        const { data: sponsorUser, error: sponsorErr } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', sponsorCode)
          .maybeSingle(); // returns null if not found
        if (sponsorErr) {
          console.error('Sponsor lookup error:', sponsorErr);
        }
        if (sponsorUser?.id) {
          const { error: refErr } = await supabase
            .from('referrals')
            .insert({
              sponsor_id: sponsorUser.id,
              referred_id: userId,
              level: 1,
            });
          if (refErr) {
            console.error('Referral insertion error:', refErr);
          }
        }
      }
      
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

  // Stagger animation container
  const containerVariants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
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
          {/* Top Brand Pill Indicator with Active Pack Status */}
          <motion.div variants={itemVariants} className={styles.badgeWrapper}>
            <span className={styles.badge}>Professional Pack — $3</span>
          </motion.div>
          
          <motion.div variants={itemVariants} className={styles.header}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Start building your global passive income stream today</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={styles.successMessage}
              >
                <div className={styles.successIcon}>🎉</div>
                <h3>Registration Successful!</h3>
                <p>Welcome aboard! redirecting you to sign in to activate your package...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className={styles.form}>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className={styles.selectWrapper}>
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
                </motion.div>

                <motion.div variants={itemVariants} className={styles.selectWrapper}>
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
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a highly secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Sponsor Code (Optional)"
                    type="text"
                    placeholder="Enter sponsor referral code"
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className={styles.checkboxWrapper}>
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
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className={styles.error}
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-3">
                  <Button type="submit" loading={loading} className={styles.submitBtn}>
                    Join Now • Just $3
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
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className={styles.footer}>
            Already have an account? <Link href="/signin" className={styles.link}>Sign In</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
