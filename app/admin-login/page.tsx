'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Hardcoded admin credentials
    if (email === 'fazal@gmail.com' && password === '786786') {
      sessionStorage.setItem('isAdmin', 'true');
      router.push('/admin');
    } else {
      setError('Invalid admin credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0710 0%, #120D1D 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(232,67,147,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
          }}>
            <span style={{
              padding: '4px 12px',
              background: 'linear-gradient(90deg, #E84393, #FF9A86)',
              color: '#050505',
              fontSize: '11px', fontWeight: 900, letterSpacing: '2px',
              borderRadius: '20px', textTransform: 'uppercase',
            }}>UIP</span>
            <span style={{
              fontSize: '16px', fontWeight: 900, letterSpacing: '3px',
              background: 'linear-gradient(90deg, #fff, #aaa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
            }}>Admin Panel</span>
          </div>
          <p style={{ color: '#888', fontSize: '13px', letterSpacing: '1px' }}>
            Restricted Access — Authorised Only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(18,13,29,0.8)',
          border: '1px solid rgba(232,67,147,0.2)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 0 60px rgba(232,67,147,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}>
          <h1 style={{
            color: '#fff', fontSize: '22px', fontWeight: 800,
            marginBottom: '6px', textAlign: 'center',
          }}>Admin Login</h1>
          <p style={{
            color: '#666', fontSize: '13px', textAlign: 'center', marginBottom: '32px',
          }}>Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#aaa', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(232,67,147,0.2)',
                  borderRadius: '12px', color: '#fff',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(232,67,147,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(232,67,147,0.2)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#aaa', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(232,67,147,0.2)',
                  borderRadius: '12px', color: '#fff',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(232,67,147,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(232,67,147,0.2)'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)',
                borderRadius: '10px', padding: '12px 16px',
                color: '#ff6b6b', fontSize: '13px', marginBottom: '16px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading
                  ? 'rgba(232,67,147,0.4)'
                  : 'linear-gradient(90deg, #E84393, #FF9A86)',
                border: 'none', borderRadius: '12px',
                color: loading ? '#fff' : '#050505',
                fontSize: '14px', fontWeight: 900,
                letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(232,67,147,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel →'}
            </button>
          </form>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none', border: 'none', color: '#666',
                fontSize: '13px', cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
